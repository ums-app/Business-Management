import React from 'react'

function LoadingTemplateContainer(props) {
    return (
        <section className={'full_width ' + props.className}>
            {props.children}
        </section>
    )
}

export default LoadingTemplateContainer