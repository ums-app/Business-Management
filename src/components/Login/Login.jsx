import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useStateValue } from '../../context/StateProvider';
import { t } from 'i18next';
import * as yup from "yup";
import ICONS from '../../constants/Icons';
import "./Login.css"
import { auth, db } from '../../constants/FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Button from '../UI/Button/Button';
import bebevit from "../../assets/img/bebvit.jpg"
import { useLocalStorage } from 'usehooks-ts';
import { getUserByEmail, getUserImage } from '../../Utils/FirebaseTools.ts';
import Collections from '../../constants/Collections';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { actionTypes } from '../../context/reducer';
import { encryptData } from '../../Utils/Encryption.ts';

function Login() {
    const [, dispatch] = useStateValue();
    const [error, setError] = useState(null); // Define error state
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for displaying password
    const navigate = useNavigate();

    const login = async (values, { setSubmitting }) => {
        setLoading(true);
        signInWithEmailAndPassword(auth, values.email, values.password)
            .then(res => {
                dispatch({
                    type: actionTypes.SET_SMALL_LOADING,
                    payload: true
                })
                getUserByEmail(values.email)
                    .then(user => {
                        setSubmitting(true);
                        if (!user.disabled) {
                            // Encrypt and store each item in localStorage
                            const itemsToStore = {
                                name: user.name,
                                lastname: user.lastName,
                                email: user.email,
                                originalEntityId: user.originalEntityId,
                                userType: user.userType,
                                userId: user.id,
                                roles: user?.roles?.join(','), // Encrypt as comma-separated string
                                locale: 'fa',
                            };

                            // Loop through each item and encrypt the key-value pair
                            Object.entries(itemsToStore).forEach(([key, value]) => {
                                const { encryptedKey, encryptedValue } = encryptData(key, value);
                                localStorage.setItem(encryptedKey, encryptedValue);
                            });

                            console.log('dispatching data');
                            dispatch({
                                type: actionTypes.SET_AUTHENTICATION,
                                payload: {
                                    name: user.name,
                                    lastname: user.lastName,
                                    email: user.email,
                                    originalEntityId: user.originalEntityId,
                                    userType: user.userType,
                                    userId: user.id,
                                    roles: user?.roles,
                                }
                            });
                            console.log('nav to home');
                            navigate("/");
                        } else {
                            dispatch({
                                type: actionTypes.LOGOUT,
                            });

                        }
                    })
                    .catch(err => {
                        setError(err.message);
                    })
                    .finally(() => {
                        setSubmitting(false);
                        setError(t('accountLocked'))
                        dispatch({
                            type: actionTypes.SET_SMALL_LOADING,
                            payload: false
                        })
                    })
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
                setSubmitting(false);
                dispatch({
                    type: actionTypes.SET_SMALL_LOADING,
                    payload: false
                })
            })
    }

    return (
        <Formik
            initialValues={{
                email: "",
                password: "",
            }}
            validationSchema={yup.object({
                email: yup
                    .string()
                    .email(t("invalidEmail"))
                    .max(50, t("emailMaxWidth"))
                    .required(`${t("email")} ${t("isRequireText")}`),
                password: yup
                    .string()
                    .min(5, t("passwordMinWidth"))
                    .required(`${t("passwordPlaceholder")} ${t("isRequireText")}`),
            })}
            onSubmit={login}
        >
            <div className="login display_flex" style={{ backgroundImage: `url(${bebevit})` }}>


                <div
                    className="login_form   full_width display_flex flex_direction_column justify_content_center align_items_center">
                    <h1 className=' title text_align_center bold'>{t('bebevit')}</h1>
                    <div className="login_form_container">
                        <h2 className="text_align_center bold">{t("loginPageTitle")}</h2>
                        <Form className="display_flex flex_direction_column">
                            {error && (
                                <div className="not_found_email_error_msg">{error}</div>
                            )}{" "}
                            {/* Display error message */}
                            <div className="login_form_input_box">
                                <Field
                                    name="email"
                                    id="email"
                                    type="email"
                                    placeholder={t("emailPlaceholder")}
                                />
                                {/* Display validation error for email */}
                                <ErrorMessage
                                    name="email"
                                    component="div"
                                    className="error_msg"
                                />
                            </div>
                            <div className="login_form_input_box">
                                <div className="login_password_input_container">
                                    <Field
                                        name="password"
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder={t("passwordPlaceholder")}
                                    />
                                    <span onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <i className={ICONS.eyeSlash}></i>
                                        ) : (
                                            <i className={ICONS.eye}></i>
                                        )}
                                    </span>
                                </div>
                                {/* Display validation error for password */}
                                <ErrorMessage
                                    name="password"
                                    component="div"
                                    className="error_msg"
                                />
                            </div>
                            <div className="button_container display_flex justify_content_center align_items_center">

                                <Button
                                    text={loading ? t("signInLoading") : t("signInBtn")}
                                    btnType={'submit'}
                                    type={'loginBtn'}
                                />
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </Formik>
    );
}

export default Login