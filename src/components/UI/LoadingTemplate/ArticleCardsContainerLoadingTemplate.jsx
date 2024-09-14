import React from 'react'
import LoadingTemplateContainer from './LoadingTemplateContainer'
import ArticleCardLoadingTemplate from './ArticleCardLoadingTemplate'

function ArticleCardsContainerLoadingTemplate() {
    return (
        <LoadingTemplateContainer className="display_flex flex_direction_column align_items_center">
            <ArticleCardLoadingTemplate />
            <ArticleCardLoadingTemplate />
            <ArticleCardLoadingTemplate />
            <ArticleCardLoadingTemplate />
        </LoadingTemplateContainer>
    )
}

export default ArticleCardsContainerLoadingTemplate