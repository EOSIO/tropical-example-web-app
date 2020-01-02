import React from 'react'
import { func } from 'prop-types'
import './SearchBox.scss'

const SearchBox = ({ onSearch }) => {
  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch()
  }

  return (
    <form className='search-box-container' onSubmit={handleSubmit}>
      <h2 className='search-box-title'>Search a Property</h2>
      <div className='search-field name'><div className='blurb' /></div>
      <div className='search-field location'><div className='blurb' /></div>
      <div className='search-field left'><div className='blurb' /></div>
      <div className='search-field right'><div className='blurb' /></div>
      <button className='search-button' type='submit' aria-label='Search a Property Submit'>Continue</button>
    </form>
  )
}

SearchBox.propTypes = {
  onSearch: func.isRequired,
}

export default SearchBox
