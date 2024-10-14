import React from "react"
import "./SmallSpinner.css"

const SmallSpinner = ({ visibility = false }) => {
  return (
    <div className="sm_ring" style={{
      visibility: visibility ? 'visible' : 'hidden'
    }}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export default SmallSpinner
