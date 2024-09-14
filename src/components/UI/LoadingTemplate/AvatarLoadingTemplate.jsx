import React from 'react'
import "./LoadingTemplate.css"

function AvatarLoadingTemplate({ size = "medium" }) {
    return (
        <div className={'loading-template animate-translate avatar ' + size}></div>
    )
}

export default AvatarLoadingTemplate