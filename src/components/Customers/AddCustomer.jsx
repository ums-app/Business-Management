import { ErrorMessage, Field, Formik } from 'formik'
import React, { useState } from 'react'
import { Form } from 'react-router-dom'
import Button from '../UI/Button/Button'
import { t } from 'i18next'
import * as yup from "yup";
import { toast } from 'react-toastify'

function AddCustomer() {


    const sendDataToAPI = () => {
        toast.success("data added")
    }


    return (
        <div>
            <h1 className='title_2'>{t('add')} {t('customer')}</h1>
            <Formik
                // initialValues={{
                //     name: editMode ? subject?.name : "",
                //     credit: editMode ? subject?.credit : "",
                //     subjectCode: editMode ? subject?.subjectCode : "",
                //     goals: editMode ? subject?.goals : "",
                //     contents: editMode ? subject?.content : "",
                //     courseCategory: editMode ? subject?.courseCategory : "",
                //     prerequisite: editMode ? subject?.prerequisite : "",
                // }}
                validationSchema={CustomerSchema}
                onSubmit={sendDataToAPI}
            >
                {({ isSubmitting }) => (
                    <Form
                        className="add_form display_flex flex_direction_column"
                        style={{ gap: "3px" }}
                    >
                        <div
                            className="full_width"
                            style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}
                        >
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
                                <label htmlFor="lastName">{t('lastName')}</label>
                                <Field
                                    name="lastName"
                                    type="text"
                                    className="input"
                                    min={1}
                                />
                                <ErrorMessage
                                    name="lastName"
                                    component="div"
                                    className="error_msg"
                                />
                            </div>

                            <div className='display_flex flex_direction_column margin_5'>
                                <label htmlFor="lastName">{t('name')} {t('organization')}</label>
                                <Field
                                    name="organizationName"
                                    type="text"
                                    className="input"
                                    min={1}
                                />
                                <ErrorMessage
                                    name="organizationName"
                                    component="div"
                                    className="error_msg"
                                />
                            </div>
                            <div className='display_flex flex_direction_column margin_5'>
                                <label htmlFor="location">{t('location')}</label>
                                <Field
                                    name="location"
                                    type="text"
                                    className="input"
                                    min={1}
                                />
                                <ErrorMessage
                                    name="location"
                                    component="div"
                                    className="error_msg"
                                />
                            </div>

                            <div className='display_flex flex_direction_column margin_5'>
                                <label htmlFor="phoneNumber">{t('phoneNumber')}</label>
                                <Field
                                    name="phoneNumber"
                                    type="text"
                                    className="input"
                                    min={1}
                                />
                                <ErrorMessage
                                    name="phoneNumber"
                                    component="div"
                                    className="error_msg"
                                />
                            </div>
                            <div className='display_flex flex_direction_column margin_5'>
                                <label htmlFor="password">{t('password')}</label>
                                <Field
                                    name="password"
                                    type="text"
                                    className="input"
                                    min={1}
                                />
                                <ErrorMessage
                                    name="password"
                                    component="div"
                                    className="error_msg"
                                />
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

        </div>
    )
}


// Define the validation schema using Yup
const CustomerSchema = yup.object().shape({
    name: yup
        .string()
        .min(2, `${t("name")} ${t("isShortText")}`)
        .max(40, `${t("name")} ${t("isLongText")}`)
        .required(`${t("name")} ${t("isRequireText")}`),
    lastName: yup
        .string()
        .min(3, `${t("lastName")} ${t("isShortText")}`)
        .max(30, `${t("lastName")} ${t("isLongText")}`)
        .required(`${t("lastName")} ${t("isRequireText")}`),
    phoneNumber: yup
        .string()
        .matches(/^07[0-9]{8}$/, t("invalidContactNumber"))
        .required(`${t("contactNumber")} ${t("isRequireText")}`),
    password: yup
        .string()
        .min(5, t("passwordMinWidth"))
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/,
            t("invalidPassword"))
        .required(`${t("password")} ${t("isRequireText")}`)
});

export default AddCustomer