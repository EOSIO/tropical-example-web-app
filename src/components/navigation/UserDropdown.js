import React from 'react'
import { func } from 'prop-types'
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
    enroll: func.isRequired
  }

  state = {
    enrolled: false
  }

  render() {
    const { logout, enroll } = this.props;
    const { enrolled } = this.state;
    const doEnroll = () => {
      enroll(() => this.setState({enrolled: true}))
    }
    return (
      <div
        className='user-dropdown-container'
        tabIndex={0}
        role='menuitem'
      >
        <ul>
          { !enrolled
            ? <li className='user-dropdown-item menu-item-with-icon'
                onClick={doEnroll}
                onKeyUp={event => onKeyUpEnter(event, doEnroll)}
              >
                <img src={privacyIcon} className='menu-item-icon-left' alt='' />
                <span>Enable WebAuthn 2FA</span>
              </li>
            : <li className='user-dropdown-item'>
                WebAuthn 2FA Enabled!
              </li>
          }
          <li className='user-dropdown-item menu-item-with-icon'
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
