
import React, { useState } from 'react'
import Button from '../UI/Button/Button'
import { useNavigate } from 'react-router-dom'
import { t } from 'i18next'
import { toast } from 'react-toastify'

function Products() {
    const nav = useNavigate();


    const sendDataToAPI = () => {
        toast.success("data added")
    }

    return (
        <div>
            <Button
                text={t('add') + " " + t('product')}
                onClick={() => nav('add')}
            />



        </div>
    )
}



export default Products