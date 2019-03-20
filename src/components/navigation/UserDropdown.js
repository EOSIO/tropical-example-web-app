import React from 'react'
import { func } from 'prop-types'
import './UserDropdown.scss'

import { onKeyUpEnter } from 'utils/keyPress'

const UserDropdown = ({ logout }) => (
  <div
    className='user-dropdown-container'
    tabIndex={0}
    role='menuitem'
    onClick={logout}
    onKeyUp={event => onKeyUpEnter(event, logout)}
  >
    <span className='user-dropdown-item'>
      Logout
    </span>
  </div>
)

UserDropdown.propTypes = {
  logout: func.isRequired,
}

export default UserDropdown
