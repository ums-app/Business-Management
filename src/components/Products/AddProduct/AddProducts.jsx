import React, { useEffect } from 'react'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import Button from '../../UI/Button/Button'
import { useNavigate, useParams } from 'react-router-dom'
import { t } from 'i18next'
import * as yup from "yup";
import { toast } from 'react-toastify'
import { useState } from 'react'
import "../Products.css"
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db, storage } from '../../../constants/FirebaseConfig'
import Collections from '../../../constants/Collections'
import { ref, uploadBytes } from 'firebase/storage'
import Folders from '../../../constants/Folders'

function AddProduct({ updateMode = false }) {

    const nav = useNavigate();
    const { productId } = useParams();
    const [loading, setloading] = useState();
    const productCollectionRef = collection(db, Collections.Products)
    const [product, setProduct] = useState()

    const [formData, setformData] = useState({
        name: '',
        englishName: '',
        code: '',
        manufacturer: '',
        price: '',
        inventory: ''
    })

    const [fileURL, setfileURL] = useState('');
    const [fileValue, setFileValue] = useState()

    useEffect(() => {
        if (updateMode) {
            const getData = async () => {
                try {
                    const data = await getDoc(doc(db, Collections.Products, productId));
                    console.log('data is exist and set');
                    if (data.exists()) {
                        setformData({ ...data.data() })
                        setProduct({ ...data.data() })
                    }

                } catch (err) {
                    console.log(err);
                }
            }
            getData();
        }

    }, [productId])


    const sendDataToAPI = async (values, { setSubmitting }) => {
        console.log('send method called');
        setloading(true)
        try {

            if (updateMode) {
                const productDoc = doc(db, Collections.Products, productId)
                await updateDoc(productDoc, values)
                uploadProductImage(productId)
                toast.success(t('successfullyUpdated'))
            } else {
                const productRes = await addDoc(productCollectionRef, { ...values, createdDate: new Date() })
                uploadProductImage(productRes.id)
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

    const uploadProductImage = async (productId) => {
        if (!fileValue) return

        try {
            const folderRef = ref(storage, Folders.ProductImages(productId));
            await uploadBytes(folderRef, fileValue)
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className='add_product'>
            <h1 className='title'>{updateMode ? t('update') : t('add')} {t('product')}</h1>
            <Button
                text={t('back')}
                onClick={() => nav(-1)}
                type={" margin_bottom_10"}
            />
            <div className='display_flex justify_content_center'>
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
            </div>
            <Formik
                initialValues={formData}
                validationSchema={Schema}
                onSubmit={sendDataToAPI}
                enableReinitialize={true}
            >
                <Form
                    className="add_form display_flex flex_direction_column"
                >
                    <div className="full_width margin_top_10 display_flex flex_direction_column">
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
                                <label htmlFor="manufacturer">{t('manufacturer')}</label>
                                <Field
                                    name="manufacturer"
                                    type="text"
                                    className="input"
                                />
                                <ErrorMessage
                                    name="manufacturer"
                                    component="div"
                                    className="error_msg"
                                />
                            </div>

                            <div className='display_flex flex_direction_column margin_5'>
                                <label htmlFor="inventory">{t('inventory')}</label>
                                <Field
                                    name="inventory"
                                    type="number"
                                    className="input"
                                />
                                <ErrorMessage
                                    name="inventory"
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
                            type={'submit'}
                            loading={loading}
                        />
                    </div>
                </Form>
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
    manufacturer: yup
        .string()
        .min(3, `${t("manufacturer")} ${t("isShortText")}`)
        .max(30, `${t("manufacturer")} ${t("isLongText")}`)
        .required(`${t("manufacturer")} ${t("isRequireText")}`),
    code: yup
        .number()
        .required(`${t("code")} ${t("isRequireText")}`),
    price: yup
        .number()
        .required(`${t("price")} ${t("isRequireText")}`),
    inventory: yup
        .number()
        .required(`${t("inventory")} ${t("isRequireText")}`),
});


export default AddProduct