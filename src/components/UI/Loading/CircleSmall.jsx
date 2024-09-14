import React from 'react'
import "./Circle.css"

function CircleSmall() {
    return (
        <div id="ftco-loader" className="fullscreen small_size">
            <svg className="circular" width="48px" height="48px">
                <circle className="pathBg" cx="24" cy="24" r="22" fill="none" strokeWidth="4" stroke="#eeeeee"></circle>
                <circle className="path" cx="24" cy="24" r="22" fill="none" strokeWidth="4" strokeMiterlimit="10" stroke="#F96D00"></circle>
            </svg>
        </div>
    )
}

export default CircleSmall