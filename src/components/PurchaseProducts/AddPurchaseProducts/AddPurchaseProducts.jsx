import { t } from 'i18next';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../UI/Button/Button';

const purchasedProduct = {
    product: {},
    numberBox: 0
}


function AddPurchaseProducts({ updateMode }) {
    const nav = useNavigate();


    const [products, setproducts] = useState([]);




    return (
        <div>
            <Button
                text={t('back')}
                onClick={() => nav(-1)}
            />
            <h1 className='title'>{updateMode ? t('update') : t('add')}  {t('purchase')}</h1>

        </div>
    )
}

export default AddPurchaseProducts