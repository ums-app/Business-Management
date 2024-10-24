import { ErrorMessage, Field, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../UI/Button/Button'
import { t } from 'i18next'
import * as yup from "yup";
import { toast } from 'react-toastify'
import { Timestamp, addDoc, collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { auth, db, storage } from '../../constants/FirebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import LoadingTemplateContainer from '../UI/LoadingTemplate/LoadingTemplateContainer'
import ShotLoadingTemplate from '../UI/LoadingTemplate/ShotLoadingTemplate'
import Collections from '../../constants/Collections'
import { checkIfEmailIsAlreadyExist, getUserImage, sendLog } from '../../Utils/FirebaseTools.ts'
import "./Customers.css"
import CustomDatePicker from '../UI/DatePicker/CustomDatePicker'
import { ref, uploadBytes } from 'firebase/storage'
import Folders from '../../constants/Folders'
import ICONS from '../../constants/Icons'
import avatar from "../../assets/img/profile_avatar.png"
import { jalaliToGregorian } from 'shamsi-date-converter'
import { mapDocToEmployee } from '../../Utils/Mapper.ts'
import { CustomerType, UserTypes, VisitorContractType } from '../../constants/Others.js'
import NotFound from '../../pages/NotFound/NotFound.jsx'
import Roles from '../../constants/Roles.js'
import { useStateValue } from '../../context/StateProvider.js'
import Circle from '../UI/Loading/Circle.jsx'

function AddCustomer({ updateMode = false }) {
    const nav = useNavigate();
    const [employees, setEmployees] = useState([]);
    const { customerId } = useParams();
    const usersCollectionRef = collection(db, Collections.Users);
    const [fileURL, setfileURL] = useState('');
    const [fileValue, setFileValue] = useState()
    const [{ authentication },] = useStateValue()


    const [formData, setformData] = useState({
        name: '',
        lastName: '',
        phoneNumber: '',
        visitor: null,
        email: '',
        location: '',
        password: '',
        joinedDate: Timestamp.fromDate(new Date()),
        CustomerType: CustomerType.HERAT
    });
    const [customer, setCustomer] = useState();

    const [loading, setloading] = useState(false)

    const employeesCollectionRef = collection(db, Collections.Employees);
    const cusomtersCollectionRef = collection(db, Collections.Customers);

    useEffect(() => {
        if (updateMode) {
            const getData = async () => {
                try {
                    const data = await getDoc(doc(db, Collections.Customers, customerId));
                    if (data.exists()) {
                        const url = await getUserImage(data.data().email);
                        console.log(url);
                        setfileURL(url)
                        setformData({ ...data.data() })
                        setCustomer({ ...data.data() })
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
        const items = querySnapshot.docs.map((doc) => mapDocToEmployee(doc))
            .filter(item => item.visitorContractType != VisitorContractType.NONE);

        setEmployees(items);
        console.log(items);
    };


    const sendDataToAPI = async (values, { setSubmitting }) => {
        // e.preventDefault();
        setloading(true)
        console.log(values);
        try {

            if (updateMode) {
                const customerDoc = doc(db, Collections.Customers, customerId)
                await updateDoc(customerDoc, { ...formData });
                uploadImage(customer.email.toLowerCase())

                const log = {
                    createdDate: new Date(),
                    registrar: `${authentication.name} ${authentication.lastname}`, // Assume you have a way to track the current user
                    title: `${t('update')} ${t('customer')}`,
                    message: `${t('customer')} [${customer.name} ${customer.lastName}] ${t('successfullyUpdated')}`,
                    data: { ...formData, id: customerId }
                };
                await sendLog(log);
                toast.success(t('successfullyUpdated'))
                nav('/customers/' + customerId)
            } else {

                const emailExists = await checkIfEmailIsAlreadyExist(values.email.toLowerCase());
                if (emailExists) {
                    toast.error(t('email') + " " + t('alreadyExist'));
                    return;
                }

                createUserWithEmailAndPassword(auth, values.email.toLowerCase(), values.password)
                const customerRes = await addDoc(cusomtersCollectionRef, { ...formData, createdDate: Timestamp.fromDate(new Date()), })
                await uploadImage(values.email)
                await addDoc(usersCollectionRef, {
                    joinedDate: Timestamp.fromDate(new Date()),
                    lastName: values.lastName,
                    name: values.name,
                    originalEntityId: customerRes.id,
                    password: values.password,
                    phoneNumber: values.phoneNumber,
                    email: values.email.toLowerCase(),
                    roles: [],
                    userType: UserTypes.CUSTOMER,
                    disabled: false
                })

                const log = {
                    createdDate: new Date(),
                    registrar: `${authentication.name} ${authentication.lastname}`, // Assume you have a way to track the current user
                    title: `${t('add')} ${t('customer')}`,
                    message: `${t('customer')} [${values.name} ${values.lastName}] ${t('successfullyAdded')}`,
                    data: { ...values, id: customerRes.id }
                };
                await sendLog(log);

                toast.success(t('successfullyAdded'))
                nav('/customers')
            }

        } catch (err) {
            toast.error(err)

        } finally {
            setloading(false)
            setSubmitting(false);
        }
        // navigate to the employees page
    }


    const uploadImage = async (email) => {
        if (!fileValue) return

        try {
            const folderRef = ref(storage, Folders.UserImages(email));
            await uploadBytes(folderRef, fileValue)
        } catch (err) {
            console.error(err);
        }
    }

    console.log(formData);


    if (!authentication.isAuthenticated) {
        return <Circle />; // or return null; for no UI during loading
    }


    if (!authentication.roles.includes(Roles.ADMIN) && !authentication.roles.includes(Roles.SUPER_ADMIN)) {
        return <NotFound />
    }

    if (updateMode && formData.name.length == 0) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }


    return (
        <Formik
            initialValues={formData}
            validationSchema={CustomerSchema}
            onSubmit={sendDataToAPI}
            enableReinitialize={true}
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
                    onChange={e => {
                        const name = e.target.name
                        formData[name] = e.target.value;
                        setformData({ ...formData, })
                    }}
                >
                    <div className="add_img_profile">
                        <img
                            src={
                                fileURL ? fileURL : avatar
                            }
                            className="input_profile_img"
                            alt="user_image"
                        />
                        <span className="upload_icon display_flex align_items_center justify_content_center cursor_pointer">
                            <i className={ICONS.camera}></i>
                        </span>
                        <input
                            type={"file"}
                            accept="image/*"
                            id="input"
                            name="profileImage"
                            onChange={(e) => {
                                const file = e.currentTarget.files[0];
                                setFileValue(file);
                                setfileURL(URL.createObjectURL(e.target.files[0]));
                            }}
                        />
                    </div>
                    <ErrorMessage name="image" component="div" className="error_msg" />
                    <div
                        className="full_width"
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
                        <div className='display_flex flex_direction_column margin_5' style={{ direction: "rtl" }}>
                            <label htmlFor="joinedDate">{t('joinedDate')}</label>
                            <CustomDatePicker
                                value={formData?.joinedDate instanceof Timestamp ?
                                    formData?.joinedDate?.toDate()
                                    : new Date(formData?.joinedDate)}
                                name={'joinedDate'}
                                onChange={e => {
                                    const dateArray = jalaliToGregorian(e.year, e.month.number, e.day);

                                    // Ensure leading zeros for month and day
                                    const year = dateArray[0];
                                    const month = String(dateArray[1]).padStart(2, '0');
                                    const day = String(dateArray[2]).padStart(2, '0');

                                    // ISO format: YYYY-MM-DD
                                    const dateString = `${year}-${month}-${day}T00:00:00Z`;
                                    const date = new Date(dateString);

                                    console.log("Converted Date:", date); // Log for debugging

                                    // Validate the date
                                    if (isNaN(date.getTime())) {
                                        console.error("Invalid Date after conversion:", date);
                                        toast.error(t('Invalid Date Detected'));
                                        return;
                                    }

                                    // If the date is valid, store it in the Firebase Timestamp
                                    setformData({
                                        ...formData,
                                        joinedDate: Timestamp.fromDate(date) // Ensure it's in the correct format
                                    });
                                }}
                            />

                            <ErrorMessage
                                name="joinedDate"
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

                        <div className={`display_flex flex_direction_column margin_5  ${updateMode && ' display_none'}`}>
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
                        <div className={`display_flex flex_direction_column margin_5  ${updateMode && ' display_none'}`}>
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
                            <label htmlFor="customerType">{t('customerType')}</label>
                            <Field
                                name="customerType"
                                as='select'
                                className="input"
                            >
                                <option value={undefined} disabled >{t('customerType')}</option>
                                {Object.keys(CustomerType)?.map(key => {
                                    return <option value={key} key={key}>{t(key)}</option>
                                })}
                            </Field>
                            <ErrorMessage
                                name="customerType"
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
                                <option value={undefined}>{t('visitor')}</option>
                                {employees?.map(item => {
                                    return <option value={item.id} key={item.id}>{item.name} {item.lastName}</option>
                                })}
                                <option value={undefined}>{t('none')}</option>


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
                            type="submit"
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
    location: yup
        .string()
        .min(3, `${t("location")} ${t("isShortText")}`)
        .max(30, `${t("location")} ${t("isLongText")}`)
        .required(`${t("location")} ${t("isRequireText")}`),
    visitor: yup
        .string()
        .required(`${t("visitor")} ${t("isRequireText")}`),
    customerType: yup
        .string()
        .required(`${t("customerType")} ${t("isRequireText")}`),
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