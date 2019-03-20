import React from 'react'
import { func, instanceOf, oneOfType, shape } from 'prop-types'
import { EOSIOAuthUser } from '@blockone/ual-eosio-reference-authenticator'
import { ScatterUser } from '@blockone/ual-scatter'
import { LynxUser } from '@blockone/ual-lynx'
import { TokenPocketUser } from '@blockone/ual-token-pocket'
import { withUAL } from '@blockone/ual-reactjs-renderer'
import './NavigationBar.scss'

import UserInfo from 'components/navigation/UserInfo'
import LoginButton from 'components/navigation/LoginButton'
import { onKeyUpEnter } from 'utils/keyPress'
import logo from 'assets/images/logo.svg'

const NavigationBar = ({ ual: { activeUser }, routeToLanding, login }) => (
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
          ? <li className='user-info'><UserInfo /></li>
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
}

NavigationBar.defaultProps = {
  ual: {
    activeUser: null,
  },
}

export default withUAL(NavigationBar)
