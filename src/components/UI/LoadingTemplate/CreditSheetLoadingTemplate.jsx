import React from 'react'
import AvatarLoadingTemplate from './AvatarLoadingTemplate'
import InformationCardLoadingTemplate from './InformationCardLoadingTemplate'
import ShotLoadingTemplate from './ShotLoadingTemplate'

function CreditSheetLoadingTemplate() {
    return (
        <div className=' full_width'>
            <div className='display_flex margin_bottom_10  full_width justify_content_space_between align_items_center'>
                <AvatarLoadingTemplate size='xlarge' />
                <InformationCardLoadingTemplate />
                <AvatarLoadingTemplate size='xlarge' />
            </div>
            <div className='display_flex margin_bottom_10  full_width justify_content_space_between align_items_center'>
                <InformationCardLoadingTemplate />
                <AvatarLoadingTemplate size='xlarge' />

            </div>
            <ShotLoadingTemplate />
        </div>
    )
}

export default CreditSheetLoadingTemplate