import React from 'react'
import { func } from 'prop-types'
import './ResultsPage.scss'

import ResultsHeader from 'components/results/ResultsHeader'
import ResultsProperties from 'components/results/ResultsProperties'

const ResultsPage = ({ login, displayError }) => (
  <div className='results-page'>
    <ResultsHeader />
    <div className='results-content'>
      <div className='results-intro' />
      <ResultsProperties login={login} displayError={displayError} />
    </div>
  </div>
)

ResultsPage.propTypes = {
  login: func.isRequired,
  displayError: func.isRequired,
}

export default ResultsPage
