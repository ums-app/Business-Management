import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useStateValue } from '../../context/StateProvider';
import { t } from 'i18next';
import * as yup from "yup";
import { actionTypes } from '../../context/reducer';
import ICONS from '../../constants/Icons';
import "./Login.css"
import { auth } from '../../constants/FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

function Login() {
    const [, dispatch] = useStateValue();
    const [error, setError] = useState(null); // Define error state
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for displaying password
    const navigate = useNavigate();


    const login = async (values, { setSubmitting }) => {
        setLoading(true);
        signInWithEmailAndPassword(auth, values.email, values.password)
            // createUserWithEmailAndPassword(auth, values.email, values.password)
            .then(res => {
                console.log(res);
                // const data = '';
                // console.log(data)
                // localStorage.setItem("token", data?.token);
                // localStorage.setItem("name", data?.name);
                // localStorage.setItem("lastname", data.lastname);
                // localStorage.setItem("email", data?.email);
                // localStorage.setItem("userId", data?.userId);
                // localStorage.setItem("originalEntityId", data?.originalEntityId);
                // localStorage.setItem("imageUrl", data?.imageUrl);
                // localStorage.setItem("roles", data?.roles.toString());
                // dispatch({
                //     type: actionTypes.SET_AUTHENTICATION,
                //     payload: data,
                // });
                navigate("/");
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
                setSubmitting(false);
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
                    .max(25, t("emailMaxWidth"))
                    .required(`${t("email")} ${t("isRequireText")}`),
                password: yup
                    .string()
                    .min(5, t("passwordMinWidth"))
                    .required(`${t("passwordPlaceholder")} ${t("isRequireText")}`),
            })}
            onSubmit={login}
        >
            <div className="login">
                <div className="rtl display_flex flex_direction_column justify_content_center align_items_center">
                    <h1 className=' title text_align_center'>{"BebeVit"}</h1>
                    <div className="login_form_container">

                        <h2 className="text_align_center">{t("loginPageTitle")}</h2>
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
                                <button
                                    type="submit"
                                    className="btn justify_content_center align_items_center text_align_center cursor_pointer"
                                    disabled={loading}
                                >
                                    {loading ? t("signInLoading") : t("signInBtn")}
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </Formik>
    );
}

export default Login