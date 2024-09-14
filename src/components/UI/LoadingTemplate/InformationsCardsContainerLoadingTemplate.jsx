import React from 'react'
import LoadingTemplateContainer from './LoadingTemplateContainer'
import InformationCardLoadingTemplate from './InformationCardLoadingTemplate'

function InformationsCardsContainerLoadingTemplate() {
    return (
        <LoadingTemplateContainer className="display_flex justify_content_center">
            <InformationCardLoadingTemplate />
            <InformationCardLoadingTemplate />
            <InformationCardLoadingTemplate />
            <InformationCardLoadingTemplate />
        </LoadingTemplateContainer>
    )
}

export default InformationsCardsContainerLoadingTemplate