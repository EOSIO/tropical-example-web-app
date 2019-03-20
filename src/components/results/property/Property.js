import React from 'react'
import { func } from 'prop-types'
// UAL context object that can be set via the contextType property on a class and can be referenced using this.context
import { UALContext } from '@blockone/ual-reactjs-renderer'
import './Property.scss'

import PropertyImage from 'components/results/property/PropertyImage'
import { generateTransaction, transactionConfig } from 'utils/transaction'
import { onKeyUpEnter } from 'utils/keyPress'

class Property extends React.Component {
  static contextType = UALContext

  static propTypes = {
    login: func.isRequired,
    displayError: func.isRequired,
  }

  state = {
    loading: false,
    liked: false,
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

  render() {
    const { loading, liked } = this.state

    return (
      <div className='property-container'>
        <div
          className='property-image'
          tabIndex={0}
          role='button'
          onClick={this.onLike}
          onKeyUp={event => onKeyUpEnter(event, this.onLike)}
        >
          <PropertyImage loading={loading} liked={liked} />
        </div>
        <div className='property-info property-info-1' />
        <div className='property-info property-info-2' />
        <div className='property-info property-info-3' />
      </div>
    )
  }
}

export default Property
