import React from 'react';
import './Spinner.css'

const Spinner = () => {
  return (
    <div className="spinner">
        <div className="double-bounce1"></div>
        <div className="double-bounce2"></div>
        <p className="text">Loading...</p>
    </div>
  )
}

export default Spinner