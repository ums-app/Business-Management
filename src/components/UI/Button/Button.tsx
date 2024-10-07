import React from "react";
import "./Button.css";
import ButtonLoading from "../Loading/ButtonLoading";
import ICONS from "../../../constants/Icons";
import { ButtonProps } from "../../../Types/Types";




const Button: React.FC<ButtonProps> = ({ btnType = null, isLock = undefined, isConfirmed = null, type = 'button', title, onClick, text, loading = null, icon = null, }) => {
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
        className={"btn " + btnType}
        onClick={onClick}
        title={title}
        disabled={isLock}
        type={type}
      >
        <i className={"bi " + icon}></i>
        {text}

      </button>
      {loading && <ButtonLoading />}

    </div>
  );
};

export default Button;
