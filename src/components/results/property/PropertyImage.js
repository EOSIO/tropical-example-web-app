import React from 'react'
import { bool } from 'prop-types'
import './PropertyImage.scss'

import propertySvg from 'assets/images/property.svg'

const PropertyImage = () => (
  <div className='property-image-container'>
    <img src={propertySvg} alt='property' />
  </div>
)

PropertyImage.propTypes = {
  loading: bool.isRequired,
  liked: bool.isRequired,
}

export default PropertyImage
