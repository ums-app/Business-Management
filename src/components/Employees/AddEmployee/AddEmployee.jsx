
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
import { Timestamp, addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { auth, db, storage } from '../../../constants/FirebaseConfig';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import { createUserWithEmailAndPassword, updateEmail } from 'firebase/auth';
import Collections from '../../../constants/Collections';
import { checkIfEmailIsAlreadyExist, getUserImage } from '../../../Utils/FirebaseTools.ts';
import Folders from '../../../constants/Folders';
import { ref, uploadBytes } from 'firebase/storage';
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker';
import { VisitorContractType } from '../../../constants/Others';
import { jalaliToGregorian } from 'shamsi-date-converter';


function AddEmployee({ updateMode = false }) {
    const nav = useNavigate();
    const { employeeId } = useParams();
    const employeesCollectionRef = collection(db, Collections.Employees);
    const usersCollectionRef = collection(db, Collections.Users);
    const [loading, setloading] = useState(false)
    const [fileURL, setfileURL] = useState('');
    const [fileValue, setFileValue] = useState()


    const [formData, setformData] = useState({
        name: '',
        lastName: '',
        phoneNumber: '',
        salary: '',
        email: '',
        jobTitle: '',
        password: '',
        joinedDate: Timestamp.fromDate(new Date()),
        visitorContractType: null,
        visitorAmount: 0
    })
    const [employee, setEmployee] = useState()
    const [error, seterror] = useState()

    useEffect(() => {
        console.log('useeffect');
        if (updateMode) {
            const getData = async () => {
                try {
                    const data = await getDoc(doc(db, Collections.Employees, employeeId));
                    console.log('data is exist and set');
                    if (data.exists()) {
                        const url = await getUserImage(data.data().email);
                        console.log(url);
                        setfileURL(url)
                        setformData({ ...data.data() })
                        setEmployee({ ...data.data() })
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
        console.log('send method called');
        setloading(true);

        console.log(formData, values);


        try {
            if (updateMode) {
                console.log('In update mode');
                const employeeDoc = doc(db, Collections.Employees, employeeId);

                console.log('values: ', formData);

                await updateDoc(employeeDoc, formData);
                console.log('Employee updated successfully');

                await uploadImage(employee.email.toLowerCase());
                console.log('Image uploaded successfully');

                toast.success(t('successfullyUpdated'));
                nav('/employees/' + employeeId);
            } else {
                console.log('In adding new employee mode');

                // Check if email already exists
                const emailExists = await checkIfEmailIsAlreadyExist(values.email.toLowerCase());
                if (emailExists) {
                    toast.error(t('email') + " " + t('alreadyExist'));
                    return; // Stop function if email exists
                }

                console.log('Email does not exist, creating user account');
                await createUserWithEmailAndPassword(auth, values.email.toLowerCase(), values.password);
                console.log('User account created successfully');

                console.log('Saving employee information');
                const employeeRes = await addDoc(employeesCollectionRef, {
                    ...formData,
                    email: formData.email.toLowerCase(),
                    createdDate: new Date(),
                });
                console.log('Employee added with ID:', employeeRes.id);

                console.log('Saving user entity data');
                const userDoc = await addDoc(usersCollectionRef, {
                    joinedDate: Timestamp.fromDate(new Date()),
                    lastName: values.lastName,
                    name: values.name,
                    originalEntityId: employeeRes.id,
                    password: values.password,
                    phoneNumber: values.phoneNumber,
                    email: values.email.toLowerCase(),
                    roles: [],
                    userType: 'Employee',
                });

                console.log('User entity saved with ID:', userDoc.id);

                console.log('Uploading image');
                await uploadImage(values.email.toLowerCase());
                console.log('Image uploaded successfully');

                console.log('Navigating to /employees');
                nav('/employees');

                toast.success(t('successfullyAdded'));
            }
        } catch (err) {
            console.error('Error occurred:', err);
            toast.error(err.message || t('An error occurred'));
        } finally {
            // Ensure loading is stopped and submitting is reset
            console.log('Closing the loading and setting submission to false');
            setloading(false);
            setSubmitting(false);
        }
    };


    const uploadImage = async (email) => {
        if (!fileValue) {
            console.warn('No file to upload');
            return;
        }

        try {
            const folderRef = ref(storage, Folders.UserImages(email));

            // Upload the file
            const uploadResult = await uploadBytes(folderRef, fileValue);
            console.log('Image uploaded successfully:', uploadResult.metadata.fullPath);

            return uploadResult; // Return the result in case you need it later

        } catch (err) {
            console.error('Error during image upload:', err.message || err);
            throw new Error('Failed to upload image'); // Throw the error to handle it in the calling function
        }
    };



    if (updateMode && formData.name.length == 0) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }

    console.log(formData);

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
                <Form className="add_form display_flex flex_direction_column"
                    onChange={e => {
                        const name = e.target.name
                        formData[name] = e.target.value;
                        setformData({ ...formData, })
                    }}
                >
                    {/* Here you can select Profile Student img */}
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

                        <div className={`display_flex flex_direction_column margin_5  ${updateMode && ' display_none'}`}>
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
                        <div className={`display_flex flex_direction_column margin_5  ${updateMode && ' display_none'}`}>
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
                        <div className='display_flex flex_direction_column margin_5' style={{ direction: "rtl" }}>
                            <label htmlFor="joinedDate">{t('joinedDate')}</label>
                            <CustomDatePicker
                                name={'joinedDate'}
                                value={formData?.joinedDate instanceof Timestamp ?
                                    formData?.joinedDate?.toDate()
                                    : new Date(formData?.joinedDate)}
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


                        {!updateMode && <div className='display_flex flex_direction_column margin_5'>
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
                        }

                        <div className='display_flex flex_direction_column margin_5'>
                            <label htmlFor="visitorContractType">{t('visitorContractType')}</label>
                            <Field
                                name="visitorContractType"
                                type="number"
                                as='select'
                                className="input"
                            >
                                <option value={null}></option>
                                <option value={VisitorContractType.PERCENT}>{t('percent')}</option>
                                <option value={VisitorContractType.BASED_ON_PRODUCT_NUMBER}>{t('BasedOnProductNumber')}</option>
                                <option value={null}>{t('none')}</option>
                            </Field>
                            <ErrorMessage
                                name="visitorContractType"
                                component="div"
                                className="error_msg"
                            />
                        </div>
                        {formData.visitorContractType == VisitorContractType.PERCENT && <div className='display_flex flex_direction_column margin_5'>
                            <label htmlFor="visitorAmount">{t('percent')} {t('sales')}</label>
                            <Field
                                name="visitorAmount"
                                type="number"
                                className="input"
                            />
                            <ErrorMessage
                                name="visitorAmount"
                                component="div"
                                className="error_msg"
                            />
                        </div>}
                        {formData.visitorContractType == VisitorContractType.BASED_ON_PRODUCT_NUMBER &&
                            <div className='display_flex flex_direction_column margin_5'>
                                <label htmlFor="visitorAmount">{t('amountBasedOnEachProduct')}</label>
                                <Field
                                    name="visitorAmount"
                                    type="number"
                                    className="input"
                                />
                                <ErrorMessage
                                    name="visitorAmount"
                                    component="div"
                                    className="error_msg"
                                />
                            </div>}

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
    visitorAmount: yup
        .number()
        .min(0, `${t("percent") + " " + t("sales")} ${t("isShortText")}`)
        .required(`${t("percent") + " " + t("sales")} ${t("isRequireText")}`),
    visitorContractType: yup
        .string()
        .required(`${t("visitorContractType")} ${t("isRequireText")}`),

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
        .required(`${t("password")} ${t("isRequireText")}`),
    joinedDate: yup.string()
        .required(`${t("joinedDate")} ${t("isRequireText")}`),
});

export default AddEmployee