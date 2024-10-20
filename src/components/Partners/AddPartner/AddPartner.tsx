import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react'
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker';
import { jalaliToGregorian } from 'shamsi-date-converter';
import { addDoc, collection, doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import Button from '../../UI/Button/Button';
import { t } from 'i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Circle from '../../UI/Loading/Circle';
import Roles from '../../../constants/Roles';
import { useStateValue } from '../../../context/StateProvider';
import NotFound from '../../../pages/NotFound/NotFound';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import { auth, db, storage } from '../../../constants/FirebaseConfig';
import Collections from '../../../constants/Collections';
import { Log, Partner, UpdateModeProps } from '../../../Types/Types';
import { ref, uploadBytes } from 'firebase/storage';
import Folders from '../../../constants/Folders';
import { toast } from 'react-toastify';
import { UserTypes } from '../../../constants/Others';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { checkIfEmailIsAlreadyExist, getPartnerById, getUserImage, sendLog } from '../../../Utils/FirebaseTools';
import * as yup from "yup";
import avatar from "../../../assets/img/profile_avatar.png";
import ICONS from '../../../constants/Icons';

const AddPartner: React.FC<UpdateModeProps> = ({ updateMode = false }) => {
    const nav = useNavigate();
    const [{ authentication }, dispatch] = useStateValue()
    const { partnerId } = useParams();
    const partnersCollectionRef = collection(db, Collections.Partners);
    const usersCollectionRef = collection(db, Collections.Users);
    const [loading, setloading] = useState(false)
    const [fileURL, setfileURL] = useState('');
    const [fileValue, setFileValue] = useState<File>()


    const [formData, setformData] = useState<Partner>({
        name: '',
        lastName: '',
        phoneNumber: '',
        initialCapital: 0,
        email: '',
        password: '',
        joinedDate: Timestamp.fromDate(new Date()),
        capitalHistory: [],
        createdDate: Timestamp.fromDate(new Date()),
        id: ''
    })
    const [partner, setPartner] = useState<Partner>()
    const [error, seterror] = useState()




    useEffect(() => {
        console.log('useeffect');
        if (updateMode && partnerId) {
            getPartnerById(partnerId)
                .then(res => {
                    getUserImage(res.email).then(url => setfileURL(url));
                    setformData(res)
                    setPartner(res)
                })
        }

    }, [partnerId])

    console.log(formData);

    const sendDataToAPI = async (values, { setSubmitting }) => {
        console.log('send method called');
        setloading(true);

        console.log(formData, values);


        try {
            if (updateMode && partner) {
                console.log('In update mode');
                const parnterDoc = doc(db, Collections.Partners, partnerId);

                console.log('values: ', formData);

                await updateDoc(parnterDoc, formData);
                console.log('Employee updated successfully');

                const logUp: Log = {
                    createdDate: new Date(),
                    registrar: `${authentication.name} ${authentication.lastname}`, // Assume you have a way to track the current user
                    title: `${t('update')} ${t('partner')}`,
                    message: `${t('partner')} [${partner.name} ${partner.lastName}] ${t('successfullyUpdated')}`,
                    data: { ...formData, id: partnerId }
                };
                await sendLog(logUp)

                await uploadImage(partner.email.toLowerCase());
                console.log('Image uploaded successfully');

                toast.success(t('successfullyUpdated'));
                nav('/partners/' + partnerId);
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

                console.log('Saving parnter information');
                const partnerRes = await addDoc(partnersCollectionRef, {
                    ...formData,
                    email: formData.email.toLowerCase(),
                    createdDate: new Date(),
                });
                console.log('Employee added with ID:', partnerRes.id);

                console.log('Saving user entity data');
                const userDoc = await addDoc(usersCollectionRef, {
                    joinedDate: Timestamp.fromDate(new Date()),
                    lastName: values.lastName,
                    name: values.name,
                    originalEntityId: partnerRes.id,
                    password: values.password,
                    phoneNumber: values.phoneNumber,
                    email: values.email.toLowerCase(),
                    roles: [],
                    userType: UserTypes.PARTNER,
                    disabled: false
                });

                console.log('User entity saved with ID:', userDoc.id);
                const log: Log = {
                    createdDate: new Date(),
                    registrar: `${authentication.name} ${authentication.lastname}`, // Assume you have a way to track the current user
                    title: `${t('add')} ${t('partner')}`,
                    message: `${t('partner')} [${values.name} ${values.lastName}] ${t('successfullyAdded')}`,
                    data: { ...values, id: partnerRes.id }
                };
                await sendLog(log);

                console.log('Uploading image');
                await uploadImage(values.email.toLowerCase());
                console.log('Image uploaded successfully');

                console.log('Navigating to /employees');
                nav('/partners');

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


    const uploadImage = async (email: string) => {
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


    if (!authentication.isAuthenticated) {
        return <Circle />; // or return null; for no UI during loading
    }


    if (!authentication.roles.includes(Roles.SUPER_ADMIN)) {
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
            // validationSchema={EmployeeSchema}
            onSubmit={sendDataToAPI}
            enableReinitialize={true}
        >
            <div className='add_employee padding_bottom_10'>
                <Button
                    text={t('back')}
                    onClick={() => nav(-1)}

                />
                <h1 className='title'>{updateMode ? t('update') : t('add')} {t('partner')}</h1>
                <Form className="add_form display_flex flex_direction_column"
                    onChange={e => {
                        const { name, value } = e.target;
                        setformData(prev => ({ ...prev, [name]: value }));
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                                    console.log(date);

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
                            <label htmlFor="salary">{t('initialCapital')}</label>
                            <Field
                                name="initialCapital"
                                type="number"
                                className="input"
                            />
                            <ErrorMessage
                                name="initialCapital"
                                component="div"
                                className="error_msg"
                            />
                        </div>
                        }


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
    initialCapital: yup
        .number()
        .min(0, `${t("initialCapital")} ${t("isShortText")}`)
        .required(`${t("initialCapital")} ${t("isRequireText")}`),

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


export default AddPartner


