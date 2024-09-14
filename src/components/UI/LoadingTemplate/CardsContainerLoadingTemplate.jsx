import React from 'react'
import "./LoadingTemplate.css"
import CardLoadingTemplate from './CardLoadingTemplate'

function CardsContainerLoadingTemplate() {
    return (
        <div className='text_align_center'>
            <div className='display_flex justify_content_center'>
                <CardLoadingTemplate />
                <CardLoadingTemplate />
                <CardLoadingTemplate />
            </div>
            <div className='display_flex justify_content_center'>
                <CardLoadingTemplate />
                <CardLoadingTemplate />
                <CardLoadingTemplate />
            </div>
        </div>
    )
}

export default CardsContainerLoadingTemplate