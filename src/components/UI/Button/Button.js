import React from "react";
import "./Button.css";
import ButtonLoading from "../Loading/ButtonLoading";
import ICONS from "../../../constants/Icons";

const Button = ({
  type,
  icon,
  onClick,
  btnType,
  text,
  id,
  loading = false,
  title = "",
  isLock = false,
  isConfirmed = false,
  ...props
}) => {
  return (
    <div className="btn_container">
      {isLock ? <span
        id="lock_button"
        className="display_flex justify_content_center align_items_center"
        style={isConfirmed ? { color: "green", background: "#ffffffe0", fontSize: "28px" } : {}}
      >
        {isConfirmed && <i className={"bi " + ICONS.thick}></i>}
      </span> : null}
      <button
        className={"btn " + type}
        type={btnType}
        onClick={!isLock ? onClick : null}
        title={title}
        id={id}
        disabled={isLock}
      >
        <i className={"bi " + icon}></i>
        {text}
        {props.children}
      </button>
      {loading && <ButtonLoading />}

    </div>
  );
};

export default Button;
