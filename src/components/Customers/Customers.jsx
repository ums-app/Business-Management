import { ErrorMessage, Field, Formik } from 'formik'
import React, { useState } from 'react'
import { Form } from 'react-router-dom'
import Button from '../UI/Button/Button'
import Modal from '../UI/modal/Modal'
import { t } from 'i18next'
import * as yup from "yup";
import { toast } from 'react-toastify'
import AddCustomer from './AddCustomer'


function Customers() {
    const [addFormModal, setaddFormModal] = useState(false)


    const sendDataToAPI = () => {
        toast.success("data added")
    }

    return (
        <div>
            <Button
                text={t('add') + " " + t('customer')}
                onClick={() => setaddFormModal(true)}
            />

            <Modal show={addFormModal} modalClose={() => setaddFormModal(false)}>
                <AddCustomer />
            </Modal>



        </div>
    )
}





export default Customers