import React from 'react'
import { func, bool } from 'prop-types'
// UAL context object that can be set via the contextType property on a class and can be referenced using this.context
import { UALContext } from 'ual-reactjs-renderer'
import './Property.scss'

import PropertyImage from 'components/results/property/PropertyImage'
import { generateTransaction, generateRentTransaction, transactionConfig } from 'utils/transaction'
import { generateRentChallenge, signRentChallenge, canUseWebAuthN } from 'utils/webauthn'
import { onKeyUpEnter } from 'utils/keyPress'

import likeSvg from 'assets/images/heart/heart.svg'
import rentSvg from 'assets/images/money-bag.svg'
import rentingSvg from 'assets/images/renting.svg'

class Property extends React.Component {
  static contextType = UALContext

  static propTypes = {
    login: func.isRequired,
    displayError: func.isRequired,
    enrolled: bool.isRequired,
  }

  state = {
    loading: false,
    liked: false,
    rented: false,
    canRent: canUseWebAuthN()
  }

  onLike = async () => {
    const { login, displayError } = this.props
    // Via static contextType = UALContext, access to the activeUser object on this.context is now available
    const { activeUser } = this.context
    if (activeUser) {
      this.setState({ loading: true })
      try {
        const accountName = await activeUser.getAccountName()
        const transaction = generateTransaction(accountName)
        // The activeUser.signTransaction will propose the passed in transaction to the logged in Authenticator
        await activeUser.signTransaction(transaction, transactionConfig)
        this.setState({ liked: true })
      } catch (err) {
        displayError(err)
      }
      this.setState({ loading: false })
    } else {
      login()
    }
  }

  onRent = async () => {
    const { login, displayError } = this.props
    const { activeUser } = this.context
    if ( activeUser ) {
      if (!this.state.canRent) {
        displayError(new Error('HTTPS is required to use 2FA.'))
        return;
      } else if (!this.props.enrolled) {
        displayError(new Error('No 2FA enrolled 2FA: Please enroll in 2FA (under Login/Profile menu at the top right) to Rent.'))
        return;
      }
      this.setState({ loading: true })
      try {
        const accountName = await activeUser.getAccountName()
        const rentChallenge = await generateRentChallenge(accountName, "aproperty")
        const userAuth = await signRentChallenge(accountName, "aproperty", rentChallenge)
        const transaction = generateRentTransaction(accountName, "aproperty", rentChallenge.serverKey, rentChallenge.userKey, rentChallenge.serverAuth, userAuth)
        // The activeUser.signTransaction will propose the passed in transaction to the logged in Authenticator
        await activeUser.signTransaction(transaction, transactionConfig)
        this.setState({rented: true})
      } catch (err) {
        displayError(err)
      }
      this.setState({ loading: false })
    } else {
      login()
    }
  }

  render() {
    const { loading, liked, rented } = this.state

    return (
      <div className='property-container'>
        <div
          className='property-image'
          tabIndex={0}
          role='button'
          aria-label='Rent Property Image'
          onClick={this.onRent}
          onKeyUp={event => onKeyUpEnter(event, this.onRent)}
        >
          <PropertyImage loading={loading} liked={liked} />
        </div>
        <div className='property-info property-info-1' />
        <div className='property-info property-info-2' />
        <div className='property-info property-info-3'>
          <span
            className={`button rent-button ${rented && !loading ? 'active' : ''}`}
            tabIndex={0}
            role='button'
            aria-label='Rent Property Button'
            onClick={this.onRent}
            onKeyUp={event => onKeyUpEnter(event, this.onRent)}
          >
            <img src={rented ? rentingSvg : rentSvg} alt='rent '/>
            {rented && !loading ? 'Renting' : 'Rent'}
          </span>
          <span
            className={`button like-button ${liked && !loading ? 'active' : ''}`}
            tabIndex={0}
            role='button'
            aria-label='Like Property Button'
            onClick={this.onLike}
            onKeyUp={event => onKeyUpEnter(event, this.onLike)}
          >
            <img src={likeSvg} alt='like'/>
            {liked && !loading ? 'Liked' : 'Like'}
          </span>
        </div>
      </div>
    )
  }
}

export default Property
