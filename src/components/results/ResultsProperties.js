import React from 'react'
import { func, bool } from 'prop-types'
import './ResultsProperties.scss'

import Property from 'components/results/property/Property'

const NUM_PROPERTIES = 8

const ResultsProperties = ({ login, displayError, enrolled }) => (
  <div className='results-properties-container'>
    { [...Array(NUM_PROPERTIES).keys()].map(e => <Property login={login} displayError={displayError} key={e} enrolled={enrolled} />)
    }
  </div>
)

ResultsProperties.propTypes = {
  login: func.isRequired,
  displayError: func.isRequired,
  enrolled: bool.isRequired,
}

export default ResultsProperties
