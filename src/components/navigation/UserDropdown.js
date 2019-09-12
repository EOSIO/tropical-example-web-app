import React from 'react'
import { func } from 'prop-types'
// UAL context object that can be set via the contextType property on a class and can be referenced using this.context
import { UALContext } from 'ual-reactjs-renderer'
import './UserDropdown.scss'

import { onKeyUpEnter } from 'utils/keyPress'
import { generateEnrollTransaction, transactionConfig } from 'utils/transaction'

class UserDropdown extends React.Component {
  static contextType = UALContext

  static propTypes = {
    logout: func.isRequired,
    displayError: func.isRequired
  }

  state = {
    enrolled: false
  }

  onEnroll = async () => {
    const { displayError } = this.props
    // Via static contextType = UALContext, access to the activeUser object on this.context is now available
    const { activeUser } = this.context
    if (activeUser) {
      try {
        //const accountName = await activeUser.getAccountName()
        //const transaction = generateEnrollTransaction(accountName)
        // The activeUser.signTransaction will propose the passed in transaction to the logged in Authenticator
        //await activeUser.signTransaction(transaction, transactionConfig)
        this.setState({ enrolled: true })
      } catch (err) {
        displayError(err)
      }
    } else {
      displayError("Not Logged In!")
    }
  }

  render() {
    const { logout, displayError } = this.props;
    const { enrolled } = this.state;
    return (
      <div
        className='user-dropdown-container'
        tabIndex={0}
        role='menuitem'
      >
        <ul>
          { !enrolled
            ? <li className='user-dropdown-item'
                onClick={this.onEnroll}
                onKeyUp={event => onKeyUpEnter(event, this.onEnroll)}
              >
                Enable WebAuthn 2FA
              </li>
            : <li className='user-dropdown-item'>
                WebAuthn 2FA Enabled!
              </li>
          }
          <li className='user-dropdown-item'
            onClick={logout}
            onKeyUp={event => onKeyUpEnter(event, logout)}
          >
            Logout
          </li>
        </ul>
      </div>
    )
  }
}

export default UserDropdown
