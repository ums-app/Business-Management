import React, { useState } from 'react'
import Modal from '../UI/modal/Modal'
import { t } from 'i18next'
import Button from '../UI/Button/Button'
import { toast } from 'react-toastify'
import { ErrorMessage, Field, Formik } from 'formik'
import { Form } from 'react-router-dom'
import * as yup from "yup";
import avatar from "../../assets/img/profile_avatar.png";
import ICONS from '../../constants/Icons'
import AddEmployee from './AddEmployee/AddEmployee'

function Employees() {
    const [addFormModal, setaddFormModal] = useState(false)
    const [formData, setformData] = useState({

    })
    const [profileImage, setprofileImage] = useState();




    const sendDataToAPI = () => {
        toast.success("data added")
    }

    return (
        <div>
            <Button
                text={t('add') + " " + t('employee')}
                onClick={() => setaddFormModal(true)}
            />

            <Modal
                modalClose={() => setaddFormModal(false)}
                show={addFormModal}>
                <AddEmployee />
            </Modal>

        </div>
    )
}



export default Employees