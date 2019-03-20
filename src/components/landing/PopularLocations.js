import React from 'react'
import './PopularLocations.scss'

import previous from 'assets/images/prev-arrow.svg'
import next from 'assets/images/next-arrow.svg'

const PopularLocations = () => (
  <div className='popular-container'>
    <div className='popular-title-container'>
      <h2 className='popular-title'>Popular Locations</h2>
      <div className='popular-blurb' />
    </div>
    <div className='popular-nav-container'>
      <img src={previous} alt='previous' className='popular-prev' />
      <img src={next} alt='next' className='popular-next' />
    </div>
    <div className='popular-locations'>
      <div className='popular-location' />
      <div className='popular-location' />
      <div className='popular-location' />
    </div>
  </div>
)

export default PopularLocations
