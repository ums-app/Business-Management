import { t } from 'i18next';
import React, { useState } from 'react'
import './Input.css'
import ICONS from '../../../constants/Icons';

function Input({ type = 'text', state, setState, placeholder = '', lable = false, name, max = 100, min = 2, fullWidth = '', ...props }) {
    const [errorMsg, setErrorMsg] = useState('')
    const [showPass, setshowPass] = useState(false)
    const [passType, setpassType] = useState('password')
    const handleChange = (e) => {
        const isValid = validate(e.target.value);
        setState({ isValid: isValid, value: e.target.value })
    }
    const textMinMsg = `${placeholder} ${t('textMinMsg')} ${min} ${t('characters')} ${t('bashad')}!`;
    const textMaxMsg = `${t('textMaxMsg')} ${max}`
    const numberMinMsg = `${placeholder} ${t('numberMinMsg')} ${min - 1} ${t('bashad')}!`;
    const numberMaxMsg = `${t('numberMaxMsg')} ${max} ${t('bashad')}!!`

    const validate = (value) => {
        if (type == 'text' || type == 'email' || type == 'textarea') {
            if (value.length > max) {
                setErrorMsg(t(textMaxMsg))
                return false;
            }
            if (value.length < min) {
                setErrorMsg(t(textMinMsg))
                return false;
            }
        }
        if (type == 'number') {
            if (value > max) {
                setErrorMsg(t(numberMaxMsg))
                return false;
            }
            if (value < min) {
                setErrorMsg(t(numberMinMsg))
                return false;
            }
        }
        setErrorMsg('')
        return true
    }

    const handleShowPassword = () => {
        setshowPass(!showPass)
        if (showPass) {
            setpassType("text")
        } else {
            setpassType("password")
        }
    }

    let inputBox = '';

    if (type == 'textarea') {
        inputBox = (
            <textarea id="" cols="30" rows="10"
                className={'input textarea' + fullWidth}
                name={name}
                value={state?.value}
                type="text"
                placeholder={placeholder}
                onChange={(e) => handleChange(e)}
                {...props}
            ></textarea>
        )
    } else if (type == 'password') {
        inputBox = (
            <div className='password_box position_relative'>
                <input
                    className={'input ' + fullWidth}
                    name={name}
                    value={state?.value}
                    type={passType}
                    placeholder={placeholder}
                    onChange={(e) => handleChange(e)}
                    {...props}
                />
                {showPass ? <i className={ICONS.eyeFill} onClick={handleShowPassword}></i> : <i className={ICONS.eyeSlashFill} onClick={handleShowPassword}></i>}
            </div>
        )
    } else {
        inputBox = (
            <input
                className={'input ' + fullWidth}
                name={name}
                value={state?.value}
                type={type}
                placeholder={placeholder}
                onChange={(e) => handleChange(e)}
                {...props}
            />
        )
    }

    return (
        <div className={'input_container display_flex flex_direction_column align_items_center '} >
            {lable ? <label htmlFor={name}>{placeholder}</label> : null}
            {inputBox}
            <span className='input_error_msg'>{errorMsg}</span>
        </div >
    )
}

export default Input