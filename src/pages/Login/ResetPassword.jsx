import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Login.css";
import "./ResetPassword.css";
import { useStateValue } from "../../context/StateProvider";
import { actionTypes } from "../../context/reducer";
import APIEnpoints from "../../constants/APIEndpoints";
import APIEndpoints from "../../constants/APIEndpoints";
import BackDrop from "../../components/UI/BackDrop/BackDrop";
import MessageBox from "../../components/UI/MessageBox/MessageBox";
import ICONS from "../../constants/Icons";
import Roles from "../../constants/Roles";
import Button from "../../components/UI/Button/Button";
import { t } from "i18next";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";

const ResetPassword = () => {
  const { id } = useParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prePassword, setPrePassword] = useState("");
  const [{ authentication }, dispatch] = useStateValue();
  const [error, setError] = useState(null);
  const [completeMsg, setCompleteMsg] = useState({ show: false, msg: "" });
  const navigate = useNavigate();
  const [loading, setloading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for displaying password
  const [showNewPassword, setShowNewPassword] = useState(false); // State for displaying password

  useEffect(() => {}, [id]);

  const sendInformation = (e) => {
    setError(null);
    e.preventDefault();

    // here should do some messaging
  
    if (password == prePassword) {
      setError("رمز جدید با رمز قبلی یکسان است");
      return;
    }
    setloading(true);
    fetch(APIEndpoints.root + APIEnpoints.login.update, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + authentication.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: id,
        email: email,
        previousPassword: prePassword,
        newPassword: password,
      }),
    })
      .then((res) => {
        setloading(false);
        if (res.ok) {
          setCompleteMsg({
            show: true,
            msg: "اطلاعات کاربری با موفقیت بروزرسانی شد!",
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data?.statusCode) {
          setError(data.message);
          return;
        }
        if (authentication.userId == id) {
          localStorage.setItem("token", data?.token);
          localStorage.setItem("name", data?.name);
          localStorage.setItem("lastname", data.lastname);
          localStorage.setItem("email", data?.email);
          localStorage.setItem("userId", data?.userId);
          localStorage.setItem("imageUrl", data?.imageUrl);
          localStorage.setItem("roles", data?.roles.toString());
          dispatch({
            type: actionTypes.SET_AUTHENTICATION,
            payload: data,
          });
        }
      });
  };
  
  return (
    <Formik
      initialValues={{
        resetemail: "",
        password: "",
        newPassword: "",
      }}
      validationSchema={yup.object({
        resetemail: yup
          .string()
          .email(t("invalidEmail"))
          .max(25, t("emailMaxWidth"))
          .required(`${t("email")} ${t("isRequireText")}`),
        password: yup
          .string()
          .min(5, t("passwordMinWidth"))
          .required(`${t("passwordPlaceholder")} ${t("isRequireText")}`),
        newPassword: yup
          .string()
          .min(5, t("passwordMinWidth"))
          .required(`${t("passwordPlaceholder")} ${t("isRequireText")}`),
      })}
    >
      <div className="reset_password box_shadow">
        <div className="reset_password_title text_align_center">
          <h2>
            {t("change") +
              " " +
              t("email") +
              " " +
              t("or") +
              " " +
              t("password")}
          </h2>
        </div>
        <Form className="display_flex align_items_center justify_content_center flex_direction_column">
          <div className="login_form_input_box">
            <Field
              name="resetemail"
              id="resetemail"
              type="email"
              placeholder={t("emailPlaceholder")}
              className="input"
              value={email}
              defaultValue={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
            />
            {/* Display validation error for email */}
            <ErrorMessage
              name="resetemail"
              component="div"
              className="error_msg"
            />
          </div>

          <div className="login_form_input_box">
            <div className="login_password_input_container">
              <Field
                name="password"
                id="password"
                className="input"
                type={showPassword ? "text" : "password"}
                placeholder={t("password")}
                value={prePassword}
                onChange={(e) => setPrePassword(e.target.value)}
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

          <div className="login_form_input_box">
            <div className="login_password_input_container">
              <Field
                name="newPassword"
                id="newPassword"
                className="input"
                type={showNewPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("newPassword")}
              />
              <span onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? (
                  <i className={ICONS.eyeSlash}></i>
                ) : (
                  <i className={ICONS.eye}></i>
                )}
              </span>
            </div>
            {/* Display validation error for password */}
            <ErrorMessage
              name="newPassword"
              component="div"
              className="error_msg"
            />
          </div>

          <div className="reset_button">
            <Button
              loading={loading}
              onClick={sendInformation}
              text={t("send")}
            />
          </div>
        </Form>

        <BackDrop show={completeMsg.show}>
          {
            <MessageBox
              messageType="info"
              firstBtn={{ btnText: "تایید", onClick: () => navigate("/") }}
              message={completeMsg.msg}
              iconType={ICONS.info}
            />
          }
        </BackDrop>
      </div>
    </Formik>
  );
};

export default ResetPassword;
