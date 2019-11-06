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

  enroll = async ( onSuccess ) => {
    console.info('enroll().top')
    // Via static contextType = UALContext, access to the activeUser object on this.context is now available
    const { ual: { activeUser } } = this.props
    if (activeUser) {
      try {
        const accountName = await activeUser.getAccountName()
        let pubkey = await generateWebauthnPubkey(accountName)
        console.info('pubkey actual:', pubkey)
        console.info('accountName:', accountName)
        pubkey.attestationObject = 'o2NmbXRmcGFja2VkZ2F0dFN0bXSjY2FsZyZjc2lnWEYwRAIgBv7IKYEGiX2BgoyaX375fAJF4HCVwyX2Imnukua8zFkCIH-V5KDVIhEqYdveBHimTg3XaRPdv6W5qcWdbwHb0Bn-Y3g1Y4FZAsAwggK8MIIBpKADAgECAgQDrfASMA0GCSqGSIb3DQEBCwUAMC4xLDAqBgNVBAMTI1l1YmljbyBVMkYgUm9vdCBDQSBTZXJpYWwgNDU3MjAwNjMxMCAXDTE0MDgwMTAwMDAwMFoYDzIwNTAwOTA0MDAwMDAwWjBtMQswCQYDVQQGEwJTRTESMBAGA1UECgwJWXViaWNvIEFCMSIwIAYDVQQLDBlBdXRoZW50aWNhdG9yIEF0dGVzdGF0aW9uMSYwJAYDVQQDDB1ZdWJpY28gVTJGIEVFIFNlcmlhbCA2MTczMDgzNDBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABBmeh5wWLbfcOe5KQqBGFqWzCf7KCS92vglI-W1ulcrkzGXNVKBZz73HybMbKx1sGER5wsBh9BiqlUtZaiwc-hejbDBqMCIGCSsGAQQBgsQKAgQVMS4zLjYuMS40LjEuNDE0ODIuMS43MBMGCysGAQQBguUcAgEBBAQDAgQwMCEGCysGAQQBguUcAQEEBBIEEPormdyeOUJXj5JKMNI8QRgwDAYDVR0TAQH_BAIwADANBgkqhkiG9w0BAQsFAAOCAQEAKOuzZ_7R2PDiievKn_bYB1fGDprlfLFyjJscOMq7vYTZI32oMawhlJ8PLfwMMWv9sXWzbmOiK7tYDq3KUoDQeYQOWh4lcmJaO_uHYDPb-yKpack4uJzhcTWUAKElLZcCqRKT1UUZ6WDdIs6KJ-sF6355t1DAAv7ZAWtxHsmtdFAb2RTLvo7ZVxKBt09E6wd85h7LBquFqXJVJn7o45gr9D8Msho4LSNeueTObbKYxAVCUEAjKyth4QzXDGIVvAO36UBxtw4S0cR_lmVaLvmdTOVafxtLH_kU7hNtnmEgRxSIZGmIgEQxFmU4ibhkhtnJyf-8k4VFNWmzRXRLjKC0N2hhdXRoRGF0YVjESZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NBAAAAh_ormdyeOUJXj5JKMNI8QRgAQMazWvuMvKEb8xOQD3-qtlYe-fi4Sp1k5cjJEqWscQ1FooyAAiBARVgV1heJP8d0YT4gOcIrumSagQPC4-tDX2ulAQIDJiABIVgg1NyYypASlGIz2rbF5H8EcVdbOtuQLV0gbqFsWV-VCWgiWCA4EuD-eahdVMbEQBWzLdBFVK7eaRxzFGf8I3-HMC1KPg'
        console.info('pubkey simulated:', pubkey)
        await enrollWebauthnPubkey(accountName, pubkey)
        this.setState({enrolled: true})
        onSuccess();
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
    const { showResults, showNotificationBar, error } = this.state

    return (
      <div className='app-container'>
        { showNotificationBar && <NotificationBar hideNotificationBar={hideNotificationBar} error={error} /> }
        <NavigationBar routeToLanding={routeToLanding} login={login} enroll={this.enroll} />
        { showResults
          ? <ResultsPage routeToLanding={routeToLanding} login={login} displayError={this.displayError} enrolled={this.state.enrolled} />
          : <LandingPage routeToResults={routeToResults} />
        }
      </div>
    )
  }
}

// Passes down the context via props to the wrapped component
export default withUAL(App)
