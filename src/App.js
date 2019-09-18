import React from 'react'
import { func, shape, instanceOf } from 'prop-types'
// HOC (Higher Order Component) to pass the UALProvider context to the component
import { withUAL } from 'ual-reactjs-renderer'
import 'App.scss'
import base64url from 'base64url'

import NavigationBar from 'components/navigation/NavigationBar'
import NotificationBar from 'components/notification/NotificationBar'
import ResultsPage from 'components/results/ResultsPage'
import LandingPage from 'components/landing/LandingPage'

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

  enroll = async ( onSuccess ) => {
    // Via static contextType = UALContext, access to the activeUser object on this.context is now available
    const { ual: { activeUser } } = this.props
    if (activeUser) {
      try {
        const accountName = await activeUser.getAccountName()
        const createCredentialOptions = {
          // Format of new credentials is publicKey
          publicKey: {
            // Relying Party
            rp: {
              name: "Tropical Stay",
              id: "localhost"
            },
            // Cryptographic challenge from the server
            challenge: new Uint8Array(26),
            // User
            user: {
              id: new Uint8Array(16),
              name: accountName,
              displayName: accountName,
            },
            // Requested format of new keypair
            pubKeyCredParams: [{
              type: "public-key",
              alg: -7,
            }],
            timeout: 60000,
            attestation: 'direct'
          }
        }

        const webauthnResp = await navigator.credentials.create(createCredentialOptions)
        const publicKeyCredentialToJSON = (pubKeyCred) => {
          if(pubKeyCred instanceof Array) {
            let arr = [];
            for(let i of pubKeyCred)
              arr.push(publicKeyCredentialToJSON(i));

            return arr
          }

          if(pubKeyCred instanceof ArrayBuffer) {
            return base64url.encode(pubKeyCred)
          }

          if(pubKeyCred instanceof Object) {
            let obj = {};

            for (let key in pubKeyCred) {
              obj[key] = publicKeyCredentialToJSON(pubKeyCred[key])
            }

            return obj
          }

          return pubKeyCred
        }

        const payload = {
          name: accountName,
          webauthnResp: publicKeyCredentialToJSON(webauthnResp)
        }

        const enrollResponse = await fetch('/api/enroll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        })

        const enrollResult = await enrollResponse.json()
        if (!enrollResult.status || enrollResult.status !== "ok")  {
          this.displayError({message: "Enrollment failed"});
        } else {
          onSuccess()
        }
      } catch (err) {
        console.error('Enroll Error', JSON.parse(JSON.stringify(err)))
        this.displayError(err)
      }
    } else {
      this.displayError({message: "Not Logged In!"})
    }
  }


  render() {
    const login = () => this.displayLoginModal(true)
    const routeToResults = () => this.displayResults(true)
    const routeToLanding = () => this.displayResults(false)
    const hideNotificationBar = () => this.clearError()
    const { showResults, showNotificationBar, error } = this.state

    return (
      <div className='app-container'>
        { showNotificationBar && <NotificationBar hideNotificationBar={hideNotificationBar} error={error} /> }
        <NavigationBar routeToLanding={routeToLanding} login={login} enroll={this.enroll} />
        { showResults
          ? <ResultsPage routeToLanding={routeToLanding} login={login} displayError={this.displayError} />
          : <LandingPage routeToResults={routeToResults} />
        }
      </div>
    )
  }
}

// Passes down the context via props to the wrapped component
export default withUAL(App)
