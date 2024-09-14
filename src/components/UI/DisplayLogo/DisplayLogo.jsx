import React from 'react'
import "./DisplayLogo.css"

function DisplayLogo({ imgURL, alt, width = "120px", height = "120px" }) {
    return (
        <div className='logo_container border_radius_50 box_shadow' style={{ width: width, height: height }}>
            <img src={imgURL} alt={alt} />
        </div>
    )
}

export default DisplayLogo