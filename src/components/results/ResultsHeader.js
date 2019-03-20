import React from 'react'
import './ResultsHeader.scss'

import SearchBar from 'components/search/SearchBar'

const ResultsHeader = () => (
  <div className='results-header-container'>
    <div className='results-header-content'>
      <SearchBar />
    </div>
  </div>
)

export default ResultsHeader
