import React from 'react'
import './SearchBar.scss'

import downArrow from 'assets/images/down-arrow.svg'

const SearchBar = () => (
  <div className='search-bar-container'>
    <div className='search-item search-item-large'>
      <div className='search-item-rectangle' />
      <div className='search-item-line' />
    </div>
    <div className='search-item search-item-large'>
      <div className='search-item-rectangle' />
      <div className='search-item-line' />
    </div>
    <div className='search-item search-item-small'>
      <div className='search-item-rectangle' />
      <img src={downArrow} alt='select' className='search-item-select' />
      <div className='search-item-line' />
    </div>
    <div className='search-item search-item-small'>
      <div className='search-item-rectangle' />
      <img src={downArrow} alt='select' className='search-item-select' />
      <div className='search-item-line' />
    </div>
  </div>
)

export default SearchBar
