import React, { Component } from 'react'
import img from '../../assets/img/error.png'
import { t } from 'i18next';
import Button from '../UI/Button/Button';
import ICONS from '../../constants/Icons';

class ErrorBoundary extends Component {
    const
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null }
    }
    componentDidCatch(error, errorInfo) {
        console.log(error)
        console.log(errorInfo)
        this.setState({ hasError: true, error: error })

    }
    backToHome = () => {
        this.state = { hasError: false, error: null };
        window.location.replace('/')


    }
    render() {
        if (this.state.hasError) {
            return <div className='display_flex align_items_center flex_direction_column' style={{ margin: 'auto' }}>
                <img src={img} alt="error" style={{
                    width: '40%',
                    marginBottom: '20px'
                }} />
                <b>{t('errorTitle')}:</b>
                <p>{this.state?.error?.message}</p>

                <div className='actions_buttons' style={{ marginTop: '20px' }}>
                    <Button icon={ICONS.repeat} text={t('tryAgain')} onClick={() => window.location.reload()} />
                    <Button icon={ICONS.door} text={t('backToHome')} onClick={this.backToHome} />
                </div>
            </div>
        }
        return this.props.children
    }
}

export default ErrorBoundary;