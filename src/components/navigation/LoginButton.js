import React from 'react'
import { func } from 'prop-types'

import { onKeyUpEnter } from 'utils/keyPress'

const LoginButton = ({ login }) => (
  <span
    className='login-button-container'
    tabIndex={0}
    role='tab'
    onClick={login}
    onKeyUp={event => onKeyUpEnter(event, login)}
  >
    Login
  </span>
)

LoginButton.propTypes = {
  login: func.isRequired,
}

export default LoginButton
