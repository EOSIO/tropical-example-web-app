import React from 'react'
import { bool } from 'prop-types'
import './PropertyImage.scss'

import heart from 'assets/images/heart/heart.svg'
import likedHeart from 'assets/images/heart/liked-heart.svg'
import loadingHeart from 'assets/images/heart/loading-heart.svg'
import propertySvg from 'assets/images/property.svg'

const PropertyImage = ({ loading, liked }) => (
  <div className='property-image-container'>
    <img src={propertySvg} alt='property' />
    {/* <img className={`heart ${!liked && !loading ? 'display' : ''}`} src={heart} alt='heart' />
    <img className={`heart ${liked && !loading ? 'display' : ''}`} src={likedHeart} alt='liked-heart' />
    <img className={`heart ${loading ? 'display' : ''}`} src={loadingHeart} alt='loading-heart' /> */}
  </div>
)

PropertyImage.propTypes = {
  loading: bool.isRequired,
  liked: bool.isRequired,
}

export default PropertyImage
