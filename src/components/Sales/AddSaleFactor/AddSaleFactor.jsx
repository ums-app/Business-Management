import { t } from 'i18next';
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../UI/Button/Button';

function AddSaleFactor({ updateMode }) {
    const nav = useNavigate();
    return (
        <div>
            <Button
                text={t('back')}
                onClick={() => nav(-1)}
            />
            <h1 className='title'>{updateMode ? t('update') : t('add')}  {t('sale')}  {t('factor')} </h1>
        </div>
    )
}

export default AddSaleFactor