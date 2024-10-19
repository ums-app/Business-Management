import React from 'react'
import "./LoadingTemplate.css"

function AvatarLoadingTemplate({ size = "medium", style }) {
    return (
        <div className={'loading-template animate-translate avatar ' + size} style={style}></div>
    )
}

export default AvatarLoadingTemplate