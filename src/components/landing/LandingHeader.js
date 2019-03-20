import React from 'react'
import { func } from 'prop-types'
import './LandingHeader.scss'

import SearchBox from 'components/search/SearchBox'

const LandingHeader = ({ routeToResults }) => (
  <div className='landing-header-container'>
    <div className='landing-header-content'>
      <SearchBox onSearch={routeToResults} />
    </div>
  </div>
)

LandingHeader.propTypes = {
  routeToResults: func.isRequired,
}

export default LandingHeader
