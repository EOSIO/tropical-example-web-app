import React from 'react'
import { bool, func, instanceOf, oneOfType, shape } from 'prop-types'
import { EOSIOAuthUser } from 'ual-eosio-reference-authenticator'
import { ScatterUser } from 'ual-scatter'
import { LynxUser } from 'ual-lynx'
import { TokenPocketUser } from 'ual-token-pocket'
import { withUAL } from 'ual-reactjs-renderer'
import './NavigationBar.scss'

import UserInfo from 'components/navigation/UserInfo'
import LoginButton from 'components/navigation/LoginButton'
import { onKeyUpEnter } from 'utils/keyPress'
import logo from 'assets/images/logo.svg'

const NavigationBar = ({ ual: { activeUser }, routeToLanding, login, enroll, enrolled }) => (
  <div className='navigation-bar-container'>
    <div className='navigation-bar-content'>
      <div
        className='navigation-bar-title-container'
        tabIndex={0}
        role='tab'
        onClick={routeToLanding}
        onKeyUp={event => onKeyUpEnter(event, routeToLanding)}
      >
        <img src={logo} alt='logo' className='navigation-bar-logo' />
      </div>
      <ul className='navigation-bar-list'>
        <li className={`post ${!activeUser && 'disabled'}`}>Post a Property</li>
        { activeUser
          ? <li className='user-info'><UserInfo enroll={enroll} enrolled={enrolled} /></li>
          : <li className='login'><LoginButton login={login} /></li>
        }
      </ul>
    </div>
  </div>
)

NavigationBar.propTypes = {
  ual: shape({
    activeUser: oneOfType([
      instanceOf(EOSIOAuthUser),
      instanceOf(ScatterUser),
      instanceOf(LynxUser),
      instanceOf(TokenPocketUser),
    ]),
  }),
  routeToLanding: func.isRequired,
  login: func.isRequired,
  enroll: func.isRequired,
  enrolled: bool.isRequired
}

NavigationBar.defaultProps = {
  ual: {
    activeUser: null,
  },
}

export default withUAL(NavigationBar)
