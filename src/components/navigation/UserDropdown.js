import React from 'react'
import { bool, func } from 'prop-types'
// UAL context object that can be set via the contextType property on a class and can be referenced using this.context
import { UALContext } from 'ual-reactjs-renderer'
import './UserDropdown.scss'
import privacyIcon from 'assets/images/privacy.svg'
import logoutIcon from 'assets/images/leave.svg'

import { onKeyUpEnter } from 'utils/keyPress'

class UserDropdown extends React.Component {
  static contextType = UALContext

  static propTypes = {
    logout: func.isRequired,
    enroll: func.isRequired,
    enrolled: bool.isRequired,
  }

  render() {
    const { logout, enrolled, enroll } = this.props;
    return (
      <div
        className='user-dropdown-container'
        tabIndex={0}
        role='menuitem'
      >
        <ul>
          { !enrolled
            ? <li className='user-dropdown-item menu-item-with-icon'
                role='button'
                aria-label='Enable WebAuthn 2FA'
                onClick={enroll}
                onKeyUp={event => onKeyUpEnter(event, enroll)}
              >
                <img src={privacyIcon} className='menu-item-icon-left' alt='privacy' />
                <span>Enable WebAuthn 2FA</span>
              </li>
            : <li className='user-dropdown-item menu-item-with-icon'>
                <img src={privacyIcon} className='menu-item-icon-left' alt='privacy' />
                WebAuthn 2FA Enabled!
              </li>
          }
          <li className='user-dropdown-item menu-item-with-icon'
            role='button'
            aria-label='Logout'
            onClick={logout}
            onKeyUp={event => onKeyUpEnter(event, logout)}
          >
            <img src={logoutIcon} className='bob9 menu-item-icon-left' alt='' />
            Logout
          </li>
        </ul>
      </div>
    )
  }
}

export default UserDropdown
