import React from 'react'
import "./LoadingTemplate.css"

function ShotLoadingTemplate({ style = null }) {
    return (
        <div className='loading-template full_width animate-translate shot' style={style}></div>
    )
}

export default ShotLoadingTemplate