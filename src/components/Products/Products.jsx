import { ErrorMessage, Field, Formik } from 'formik'
import React, { useState } from 'react'
import Button from '../UI/Button/Button'
import Modal from '../UI/modal/Modal'
import { Form } from 'react-router-dom'
import { t } from 'i18next'
import * as yup from "yup";
import { toast } from 'react-toastify'


function Products() {
    const [addFormModal, setaddFormModal] = useState(false)
    const [fileValue, setFileValue] = useState();
    const [fieldValue, setFieldValue] = useState()
    const [fileURL, setfileURL] = useState("");

    const sendDataToAPI = () => {
        toast.success("data added")
    }

    return (
        <div>
            <Button
                text={t('add') + " " + t('product')}
                onClick={() => setaddFormModal(true)}
            />

            <Modal
                modalClose={() => setaddFormModal(false)}
                show={addFormModal}>

                <h1 className='title_2'>{t('add')} {t('product')}</h1>
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
                    validationSchema={Schema}
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
                                <div
                                    className="logo_input_box"
                                    style={{ backgroundImage: `url(${fileURL})` }}
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
                                            setFieldValue("image", file);
                                            setfileURL(URL.createObjectURL(e.target.files[0]));
                                        }}
                                    />
                                    {fileURL?.length == 0 && (
                                        <label htmlFor="facultyImage">
                                            {t("select") + " " + t("logo")}
                                        </label>
                                    )}
                                </div>
                                <ErrorMessage name="image" component="div" className="error_msg" />

                                <div className='display_flex flex_direction_column margin_5'>
                                    <label htmlFor="name">{t('name')}</label>
                                    <Field
                                        name="name"
                                        type="text"
                                        className="input"
                                        placeholder={t("name")}
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
                                        placeholder={t("lastName")}
                                        min={1}
                                    />
                                    <ErrorMessage
                                        name="lastName"
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
            </Modal>

        </div>
    )
}


// Define the validation schema using Yup
const Schema = yup.object().shape({
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
});
export default Products