import React, { useState } from "react";
import Button from "../Button/Button";
import { t } from "i18next";
import "./RestrictWarning.css";
import ICONS from "../../../constants/Icons";
import { useStateValue } from "../../../context/StateProvider";
import { actionTypes } from "../../../context/reducer";
import APIEndpoints from "../../../constants/APIEndpoints";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import axiosClient from "../../../axios/axios";

function RestrictWarning({ confirmHandler }) {
  // const navigate = useNavigate();
  const [loading, setloading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for displaying password
  const [, dispatch] = useStateValue();

  const closeModal = () => {
    dispatch({
      type: actionTypes.HIDE_RESTRICT_WARNING,
    });
  };

  const submit = (values) => {
    setloading(true);
    // API call with axios
    axiosClient
      .post(APIEndpoints.login.checkPassword, values)
      .then((res) => {
        toast.success(res);
        confirmHandler();
        closeModal();
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      })
      .finally(() => {
        setloading(false); // Set submitting to false at the end regardless of outcome
      });
  };

  return (
    <div className="restrict_warning">
      <span className="close_btn" onClick={closeModal}>
        <i className={ICONS.xCircle}></i>
      </span>
      <Formik
        initialValues={{
          password: "",
        }}
        validationSchema={yup.object({
          password: yup
            .string()
            .min(5, t("passwordMinWidth"))
            .required(`${t("passwordPlaceholder")} ${t("isRequireText")}`),
        })}
        onSubmit={submit}
      >
        {({ isSubmitting }) => (
          <Form className="display_flex flex_direction_column align_items_center">
            <p>{`${t("enterYourPass")}`}</p>
            <div className="password_input_container position_relative">
              <Field
                name="password"
                type={showPassword ? "text" : "password"}
                id="resctrib_warning"
                className="input"
                autoFocus
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
            <ErrorMessage
              name="password"
              component="div"
              className="error_msg"
            />
            <Button
              onClick={submit}
              btnType={"submit"}
              text={t("confirm")}
              title={t("confirm")}
              loading={loading}
              type={"danger"}
            />
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default RestrictWarning;
