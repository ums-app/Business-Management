import React from 'react'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import Button from '../../UI/Button/Button'
import { useNavigate } from 'react-router-dom'
import { t } from 'i18next'
import * as yup from "yup";
import { toast } from 'react-toastify'
import { useState } from 'react'

import image from "../../../assets/img/bebvit1.jpg"

import "../Products.css"

function AddProducts({ updateMode = false }) {

    const nav = useNavigate();

    const [formData, setformData] = useState({

    })

    const [fileURL, setfileURL] = useState('');
    const [fileValue, setFileValue] = useState()




    const sendDataToAPI = async () => {

    }

    return (
        <div className='add_product'>
            <h1 className='title'>{updateMode ? t('update') : t('add')} {t('product')}</h1>
            <Formik
                initialValues={formData}
                validationSchema={Schema}
                onSubmit={sendDataToAPI}
                enableReinitialize={true}
            >
                {({ isSubmitting }) => (
                    <Form
                        className="add_form display_flex flex_direction_column"
                    >
                        <Button
                            text={t('back')}
                            onClick={() => nav(-1)}
                            type={" margin_bottom_10"}
                        />

                        <div className="full_width margin_top_10 display_flex flex_direction_column align_items_center">
                            <div>
                                <div
                                    className="logo_input_box display_flex border_radius_10 align_items_center justify_content_center position_relative border_1px_solid"
                                    style={{
                                        backgroundImage: `url(${fileURL})`,
                                        backgroundRepeat: 'no-repeat',
                                        width: ' 240px',
                                        height: '170px',
                                        backgroundSize: 'contain',
                                        border: '1px solid #000',
                                        backgroundPosition: 'center'

                                    }}
                                >


                                    <input
                                        name="image"
                                        type="file"
                                        id="facultyImage"
                                        className="logo_img_file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.currentTarget.files[0];
                                            setFileValue(file);
                                            setfileURL(URL.createObjectURL(e.target.files[0]));
                                        }}
                                    />
                                    {fileURL?.length == 0 && (
                                        <label htmlFor="facultyImage">
                                            {t("add") + " " + t("logo")}
                                        </label>
                                    )}
                                </div>
                                <ErrorMessage name="image" component="div" className="error_msg" />
                            </div>

                            <div className="form_inputs margin_top_20  " >
                                <div className='display_flex flex_direction_column margin_5'>
                                    <label htmlFor="name">{t('name')}</label>
                                    <Field
                                        name="name"
                                        type="text"
                                        className="input"
                                        autoFocus
                                    />
                                    <ErrorMessage
                                        name="name"
                                        component="div"
                                        className="error_msg"
                                    />
                                </div>

                                <div className='display_flex flex_direction_column margin_5'>
                                    <label htmlFor="lastName">{t('englishName')}</label>
                                    <Field
                                        name="englishName"
                                        type="text"
                                        className="input"
                                        min={1}
                                    />
                                    <ErrorMessage
                                        name="englishName"
                                        component="div"
                                        className="error_msg"
                                    />
                                </div>
                                <div className='display_flex flex_direction_column margin_5'>
                                    <label htmlFor="code">{t('code')}</label>
                                    <Field
                                        name="code"
                                        type="number"
                                        className="input"
                                    />
                                    <ErrorMessage
                                        name="code"
                                        component="div"
                                        className="error_msg"
                                    />
                                </div>
                                <div className='display_flex flex_direction_column margin_5'>
                                    <label htmlFor="companyName">{t('name')} {t('company')}</label>
                                    <Field
                                        name="companyName"
                                        type="text"
                                        className="input"
                                    />
                                    <ErrorMessage
                                        name="companyName"
                                        component="div"
                                        className="error_msg"
                                    />
                                </div>
                                <div className='display_flex flex_direction_column margin_5'>
                                    <label htmlFor="price">{t('price')}</label>
                                    <Field
                                        name="price"
                                        type="number"
                                        className="input"
                                    />
                                    <ErrorMessage
                                        name="price"
                                        component="div"
                                        className="error_msg"
                                    />
                                </div>
                            </div>

                        </div>
                        <div className=' margin_top_10 margin_left_10 margin_right_10'>
                            <Button
                                text={t('save')}
                                onClick={sendDataToAPI}
                            />
                        </div>
                    </Form>
                )}

            </Formik>

        </div >
    )
}


// Define the validation schema using Yup
const Schema = yup.object().shape({
    name: yup
        .string()
        .min(2, `${t("name")} ${t("isShortText")}`)
        .max(40, `${t("name")} ${t("isLongText")}`)
        .required(`${t("name")} ${t("isRequireText")}`),
    englishName: yup
        .string()
        .min(3, `${t("englishName")} ${t("isShortText")}`)
        .max(30, `${t("englishName")} ${t("isLongText")}`)
        .required(`${t("englishName")} ${t("isRequireText")}`),
    code: yup
        .number()
        .required(`${t("code")} ${t("isRequireText")}`),
});


export default AddProducts