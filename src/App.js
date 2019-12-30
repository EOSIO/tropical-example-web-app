import React from 'react'
import { func, shape, instanceOf } from 'prop-types'
// HOC (Higher Order Component) to pass the UALProvider context to the component
import { withUAL } from 'ual-reactjs-renderer'
import 'App.scss'

import NavigationBar from 'components/navigation/NavigationBar'
import NotificationBar from 'components/notification/NotificationBar'
import ResultsPage from 'components/results/ResultsPage'
import LandingPage from 'components/landing/LandingPage'

import {generateWebauthnPubkey, enrollWebauthnPubkey} from "utils/webauthn"

class App extends React.Component {
  static propTypes = {
    ual: shape({
      error: instanceOf(Error),
      logout: func,
      showModal: func.isRequired,
      hideModal: func.isRequired,
    }),
  }

  static defaultProps = {
    ual: {
      error: null,
      logout: () => {},
    },
  }

  state = {
    showResults: false,
    showNotificationBar: true,
    error: null,
    enrolled: false,
  }

  componentDidUpdate(prevProps) {
    // Via withUAL() below, access to the error object is now available
    // This error object will be set in the event of an error during any UAL execution
    const { ual: { error } } = this.props
    const { ual: { error: prevError } } = prevProps
    if (error && (prevError ? error.message !== prevError.message : true)) {
      // UAL modal will display the error message to the user, so no need to render this error in the app
      console.error('UAL Error', JSON.parse(JSON.stringify(error)))
    }
  }

  displayResults = display => this.setState({ showResults: display })

  displayNotificationBar = display => this.setState({ showNotificationBar: display })

  displayLoginModal = (display) => {
    // Via withUAL() below, access to the showModal & hideModal functions are now available
    const { ual: { showModal, hideModal } } = this.props
    if (display) {
      showModal()
    } else {
      hideModal()
    }
  }

  displayError = (error) => {
    if (error.source) {
      console.error('UAL Error', JSON.parse(JSON.stringify(error)))
    }
    this.setState({ error })
    this.displayNotificationBar(true)
  }

  clearError = () => {
    this.setState({ error: null })
    this.displayNotificationBar(false)
  }

  enroll = async () => {
    console.info('enroll().top')
    // Via static contextType = UALContext, access to the activeUser object on this.context is now available
    const { ual: { activeUser } } = this.props
    if (activeUser) {
      try {
        const accountName = await activeUser.getAccountName()
        const pubkey = await generateWebauthnPubkey(accountName)
        console.info('accountName:', accountName)
        console.info('pubkey:', pubkey)
        await enrollWebauthnPubkey(accountName, pubkey)
        this.setState({enrolled: true})
      } catch (err) {
        this.displayError(err)
      }
    } else {
      this.displayError(new Error("Not Logged In!"))
    }
  }

  render() {
    const login = () => this.displayLoginModal(true)
    const routeToResults = () => this.displayResults(true)
    const routeToLanding = () => this.displayResults(false)
    const hideNotificationBar = () => this.clearError()
    const { showResults, showNotificationBar, error, enrolled } = this.state

    return (
      <div className='app-container'>
        { showNotificationBar && <NotificationBar hideNotificationBar={hideNotificationBar} error={error} /> }
        <NavigationBar routeToLanding={routeToLanding} login={login} enroll={this.enroll} enrolled={enrolled} />
        { showResults
          ? <ResultsPage routeToLanding={routeToLanding} login={login} displayError={this.displayError} enrolled={enrolled} />
          : <LandingPage routeToResults={routeToResults} />
        }
      </div>
    )
  }
}

// Passes down the context via props to the wrapped component
export default withUAL(App)
