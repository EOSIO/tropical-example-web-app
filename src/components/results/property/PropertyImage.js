import React from 'react'
import { bool, func } from 'prop-types'
import './PropertyImage.scss'

import propertySvg from 'assets/images/property.svg'
import { onKeyUpEnter } from 'utils/keyPress'

const PropertyImage = ({ onRent }) => (
  <div
    className='property-image'
    tabIndex={0}
    role='button'
    aria-label='Rent Property Image'
    onClick={onRent}
    onKeyUp={event => onKeyUpEnter(event, onRent)}
  >
    <div className='property-image-container'>
      <img src={propertySvg} alt='property' />
    </div>
  </div>
)

PropertyImage.propTypes = {
  loading: bool.isRequired,
  liked: bool.isRequired,
  onRent: func.isRequired,
}

export default PropertyImage
