import { ErrorMessage, Field, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../UI/Button/Button'
import { t } from 'i18next'
import * as yup from "yup";
import { toast } from 'react-toastify'
import { addDoc, collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { auth, db } from '../../constants/FirebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth'

function AddCustomer({ updateMode = false }) {
    const nav = useNavigate();
    const [employees, setEmployees] = useState([]);
    const { customerId } = useParams();
    const usersCollectionRef = collection(db, 'Users');

    const [formData, setformData] = useState({
        name: '',
        lastName: '',
        phoneNumber: '',
        organizationName: '',
        visitor: '',
        email: '',
        location: '',
        password: ''
    });

    const [loading, setloading] = useState(false)

    const employeesCollectionRef = collection(db, 'Employees');
    const cusomtersCollectionRef = collection(db, 'Customers');

    useEffect(() => {
        if (updateMode) {
            const getData = async () => {
                try {
                    const data = await getDoc(doc(db, 'Customers', customerId));
                    if (data.exists()) {
                        setformData({ ...data.data() })
                    }
                } catch (err) {
                    console.log(err);
                }
            }
            getData();
        }

    }, [customerId])


    useEffect(() => {
        getEmployees();
    }, []);


    const getEmployees = async () => {
        const querySnapshot = await getDocs(employeesCollectionRef);
        const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setEmployees(items);
        console.log(items);
    };


    const sendDataToAPI = async (values, { setSubmitting }) => {
        // e.preventDefault();
        setloading(true)
        console.log(values);
        try {

            if (updateMode) {
                const customerDoc = doc(db, 'Customers', customerId)
                console.log(customerDoc, values);
                await updateDoc(customerDoc, values)
                toast.success(t('successfullyUpdated'))
            } else {
                const employeeRes = await addDoc(cusomtersCollectionRef, values)
                const userDoc = await addDoc(usersCollectionRef, {
                    joinedDate: new Date(),
                    lastName: values.lastName,
                    name: values.name,
                    originalEntityId: employeeRes.id,
                    password: values.password,
                    phoneNumber: values.phoneNumber,
                    email: values.email,
                    roles: [],
                    userType: 'Customer'
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


    return (
        <Formik
            initialValues={formData}
            validationSchema={CustomerSchema}
            onSubmit={sendDataToAPI}
        >
            <div>
                <Button
                    text={t('back')}
                    onClick={() => nav(-1)}
                />
                <h1 className='title'>{updateMode ? t('update') : t('add')}  {t('customer')}</h1>
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
                            <label htmlFor="organizationName">{t('name')} {t('organization')}</label>
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
                            <label htmlFor="email">{t('email')}</label>
                            <Field
                                name="email"
                                type="email"
                                className="input"
                                min={1}
                            />
                            <ErrorMessage
                                name="email"
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

                        <div className='display_flex flex_direction_column margin_5'>
                            <label htmlFor="visitor">{t('visitor')}</label>
                            <Field
                                name="visitor"
                                as='select'
                                className="input"
                            >
                                <option value={null}>{t('visitor')}</option>
                                {employees?.map(item => {
                                    return <option value={item.id}>{item.name} {item.lastName}</option>
                                })}
                                <option value={null}>{t('none')}</option>


                            </Field>
                            <ErrorMessage
                                name="visitor"
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
            </div>
        </Formik>
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
    organizationName: yup
        .string()
        .required(`${t("name") + " " + t('organization')} ${t("isRequireText")}`),
    location: yup
        .string()
        .min(3, `${t("location")} ${t("isShortText")}`)
        .max(30, `${t("location")} ${t("isLongText")}`)
        .required(`${t("location")} ${t("isRequireText")}`),
    visitor: yup
        .string()
        .required(`${t("visitor")} ${t("isRequireText")}`),
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

export default AddCustomer