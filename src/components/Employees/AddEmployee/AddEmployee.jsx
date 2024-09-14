
import { t } from 'i18next'
import React, { useState } from 'react'
import { ErrorMessage, Field, Formik } from 'formik'
import { Form } from 'react-router-dom'
import * as yup from "yup";
import avatar from "../../../assets/img/profile_avatar.png";
import ICONS from '../../../constants/Icons'
import { toast } from 'react-toastify';
import Button from '../../UI/Button/Button';

function AddEmployee() {
    const [addFormModal, setaddFormModal] = useState(false)
    const [formData, setformData] = useState({

    })
    const [profileImage, setprofileImage] = useState();




    const sendDataToAPI = () => {
        toast.success("data added")
    }

    return (
        <div>
            <h1 className='title'>{t('add')} {t('employee')}</h1>
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
                validationSchema={EmployeeSchema}
                onSubmit={sendDataToAPI}
            >
                {({ isSubmitting }) => (
                    <Form
                        className="add_form display_flex flex_direction_column"
                        style={{ gap: "3px" }}
                    >
                        {/* Here you can select Profile Student img */}
                        <div className="add_img_profile">
                            <img
                                src={
                                    profileImage?.isOk
                                        ? profileImage.url
                                        : avatar
                                }
                                className="input_profile_img"
                                alt="user_image"
                                crossOrigin="anonymous"
                            />
                            <span className="upload_icon display_flex align_items_center justify_content_center cursor_pointer">
                                <i className={ICONS.camera}></i>
                            </span>
                            <input
                                type={"file"}
                                accept="image/*"
                                id="input"
                                name="profileImage"
                            />
                        </div>
                        <ErrorMessage name="image" component="div" className="error_msg" />

                        <div
                            className=" margin_top_20  "
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)"
                            }}
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
                                <label htmlFor="jobTitle">{t('jobTitle')}</label>
                                <Field
                                    name="jobTitle"
                                    type="text"
                                    className="input"
                                    min={10}
                                />
                                <ErrorMessage
                                    name="jobTitle"
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
                                    min={10}
                                />
                                <ErrorMessage
                                    name="phoneNumber"
                                    component="div"
                                    className="error_msg"
                                />
                            </div>

                            <div className='display_flex flex_direction_column margin_5'>
                                <label htmlFor="salary">{t('salary')}</label>
                                <Field
                                    name="salary"
                                    type="number"
                                    className="input"
                                    min={10}
                                />
                                <ErrorMessage
                                    name="salary"
                                    component="div"
                                    className="error_msg"
                                />
                            </div>
                            <div className='display_flex flex_direction_column margin_5'>
                                <label htmlFor="salesPercent">{t('percent')} {t('sales')}</label>
                                <Field
                                    name="salesPercent"
                                    type="number"
                                    className="input"
                                    min={10}
                                />
                                <ErrorMessage
                                    name="salesPercent"
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
                                    min={10}
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
const EmployeeSchema = yup.object().shape({
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
    salesPercent: yup
        .number()
        .min(0, `${t("percent") + " " + t("sales")} ${t("isShortText")}`)
        .max(100, `${t("percent") + " " + t("sales")} ${t("isLongText")}`)
        .required(`${t("percent") + " " + t("sales")} ${t("isRequireText")}`),
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

export default AddEmployee