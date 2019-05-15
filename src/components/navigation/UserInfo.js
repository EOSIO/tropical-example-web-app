import React from 'react'
import { UALContext } from 'ual-reactjs-renderer'
import './UserInfo.scss'

import UserDropdown from 'components/navigation/UserDropdown'
import downArrow from 'assets/images/down-arrow.svg'
import upArrow from 'assets/images/up-arrow.svg'
import { onKeyUpEnter } from 'utils/keyPress'

class UserInfo extends React.Component {
  static contextType = UALContext

  state = {
    showDropdown: false,
    accountName: '',
  }

  async componentDidMount() {
    const { activeUser } = this.context
    if (activeUser) {
      const accountName = await activeUser.getAccountName()
      this.setState({ accountName })
    }
  }

  toggleDropdown = () => {
    this.setState(prevState => ({
      showDropdown: !prevState.showDropdown,
    }))
  }

  renderLogout = () => (
    <React.Fragment>
      <div
        className='user-info-dropdown-btn'
        tabIndex={0}
        role='button'
        onClick={this.toggleDropdown}
        onKeyUp={event => onKeyUpEnter(event, this.toggleDropdown)}
      >
        <img src={this.state.showDropdown ? upArrow : downArrow} alt='dropdown' />
      </div>
      { this.state.showDropdown && this.renderDropdown() }
    </React.Fragment>
  )

  renderDropdown = () => {
    const { logout } = this.context
    return (
      <div className='user-info-dropdown-content'>
        <UserDropdown logout={logout} />
      </div>
    )
  }

  render() {
    const { logout, isAutoLogin } = this.context
    const { accountName } = this.state
    const shouldDisplayLogout = logout && !isAutoLogin
    return (
      <div className={`user-info-container ${shouldDisplayLogout ? '' : 'user-info-hide-dropdown'}`}>
        <span className='user-info-prefix'> Signed in as </span>
        <div className='user-info-name'>{accountName}</div>
        { shouldDisplayLogout && this.renderLogout() }
      </div>
    )
  }
}

export default UserInfo
