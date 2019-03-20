import React from 'react'
import { func } from 'prop-types'
import './LandingPage.scss'

import LandingHeader from 'components/landing/LandingHeader'
import PopularLocations from 'components/landing/PopularLocations'
import leftLeaf from 'assets/images/left-leaf-background.svg'
import rightLeaf from 'assets/images/right-leaf-background.svg'

const LandingPage = ({ routeToResults }) => (
  <div className='landing-page'>
    <LandingHeader routeToResults={routeToResults} />
    <div className='landing-content'>
      <img src={leftLeaf} className='background background-left' alt='' />
      <PopularLocations />
      <img src={rightLeaf} className='background background-right' alt='' />
    </div>
  </div>
)

LandingPage.propTypes = {
  routeToResults: func.isRequired,
}

export default LandingPage
