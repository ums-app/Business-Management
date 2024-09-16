
import { t } from 'i18next'
import React, { useEffect, useState } from 'react'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import { useNavigate, useParams } from 'react-router-dom'
import * as yup from "yup";
import avatar from "../../../assets/img/profile_avatar.png";
import ICONS from '../../../constants/Icons'
import { toast } from 'react-toastify';
import Button from '../../UI/Button/Button';
import "./AddEmployee.css"
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../../constants/FirebaseConfig';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import { createUserWithEmailAndPassword } from 'firebase/auth';


function AddEmployee({ updateMode = false }) {
    const nav = useNavigate();
    const { employeeId } = useParams();
    const employeesCollectionRef = collection(db, 'Employees');
    const usersCollectionRef = collection(db, 'Users');
    const [loading, setloading] = useState(false)

    const [formData, setformData] = useState({
        name: '',
        lastName: '',
        phoneNumber: '',
        salary: '',
        salesPercent: '',
        email: '',
        jobTitle: '',
        password: ''
    })

    const [error, seterror] = useState()
    const [profileImage, setprofileImage] = useState();

    useEffect(() => {
        console.log('useeffect');
        if (updateMode) {
            const getData = async () => {
                try {
                    const data = await getDoc(doc(db, 'Employees', employeeId));
                    console.log('data is exist and set');
                    if (data.exists()) {
                        setformData({ ...data.data() })
                    }

                } catch (err) {
                    console.log(err);
                }
            }

            getData();
        }

    }, [employeeId])

    console.log(formData);

    const sendDataToAPI = async (values, { setSubmitting }) => {
        // e.preventDefault();
        setloading(true)
        try {

            if (updateMode) {
                const employeeDoc = doc(db, 'Employees', employeeId)
                console.log(employeeDoc, values);
                await updateDoc(employeeDoc, values)
                toast.success(t('successfullyUpdated'))
            } else {
                const employeeRes = await addDoc(employeesCollectionRef, values)
                const userDoc = await addDoc(usersCollectionRef, {
                    joinedDate: new Date(),
                    lastName: values.lastName,
                    name: values.name,
                    originalEntityId: employeeRes.id,
                    password: values.password,
                    phoneNumber: values.phoneNumber,
                    email: values.email,
                    roles: [],
                    userType: 'Employee'
                })
                createUserWithEmailAndPassword(auth, values.email, values.password)
                toast.success(t('successfullyAdded'))
            }
            nav(-1)
        } catch (err) {
            toast.error(err)

        } finally {
            setloading(false)
            setSubmitting(false);
        }
        // navigate to the employees page
    }


    if (updateMode && formData.name.length == 0) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }

    return (
        <Formik
            initialValues={formData}
            validationSchema={EmployeeSchema}
            onSubmit={sendDataToAPI}
        >
            <div className='add_employee padding_bottom_10'>
                <Button
                    text={t('back')}
                    onClick={() => nav(-1)}
                />
                <h1 className='title'>{updateMode ? t('update') : t('add')} {t('employee')}</h1>
                <Form className="add_form display_flex flex_direction_column">
                    {/* Here you can select Profile Student img */}
                    {/* <div className="add_img_profile">
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
                        <ErrorMessage name="image" component="div" className="error_msg" /> */}

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
                            <label htmlFor="email">{t('email')}</label>
                            <Field
                                name="email"
                                type="text"
                                className="input"
                                min={10}
                            />
                            <ErrorMessage
                                name="email"
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
                            btnType="submit"
                            id="addButton"
                            text={t("save")}
                            loading={loading}
                        />
                    </div>
                </Form>
            </div >
        </Formik>
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
    email: yup
        .string()
        .email(t("invalidEmail"))
        .required(`${t("email")} ${t("isRequireText")}`),
    password: yup
        .string()
        .min(5, t("passwordMinWidth"))
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/,
            t("invalidPassword"))
        .required(`${t("password")} ${t("isRequireText")}`)
});

export default AddEmployee