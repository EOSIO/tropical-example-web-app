import React from 'react'
import { func, instanceOf } from 'prop-types'
import './NotificationBar.scss'

import { onKeyUpEnter } from 'utils/keyPress'

const NotificationBar = ({ hideNotificationBar, error }) => (
  <div className={`notification-bar-container ${error ? 'notification-error' : ''}`}>
    <div className='notification-bar-content'>
      { error
        ? (
          <div className='notification-error-text'>
            Error:
            {' '}
            { error.message ? error.message : error.reason }
          </div>
        )
        : (
          <React.Fragment>
            <a
              className='notification-bar-title'
              href='https://github.com/EOSIO/tropical-example-web-app/'
              tabIndex={0}
            >
              Developer Demo - View Guide
            </a>
          </React.Fragment>
        )
      }
      <div
        className='notification-bar-close'
        onClick={hideNotificationBar}
        role='button'
        tabIndex={0}
        onKeyUp={e => onKeyUpEnter(e, hideNotificationBar)}
      >
        &times;
      </div>
    </div>
  </div>
)

NotificationBar.propTypes = {
  hideNotificationBar: func.isRequired,
  error: instanceOf(Error),
}

NotificationBar.defaultProps = {
  error: null,
}

export default NotificationBar
