import React from "react"
import Button from "../Button/Button"
import "./MessageBox.css"

const MessageBox = ({
  messageType,
  message,
  firstBtn,
  secondBtn,
  iconType,
}) => {
  return messageType == "info" ? (
    <div className="message_box box_shadow  display_flex flex_direction_column justify_content_center align_items_center">
      <i className={iconType + " message_icon"}></i>
      <p className="message">{message}</p>
      <Button
        text={firstBtn?.btnText}
        type={firstBtn.btnType + " box_shadow"}
        onClick={firstBtn?.onClick}
      />
    </div>
  ) : (
    <div className="message_box box_shadow display_flex flex_direction_column justify_content_center align_items_center">
      <i className={iconType + " message_icon"}></i>
      <p className="message">{message}</p>
      <div className="btn_conatainer">
        <Button
          text={firstBtn?.btnText}
          btnType={firstBtn.btnType}
          onClick={firstBtn?.onClick}
        />
        <Button text={secondBtn?.btnText} btnType={secondBtn.btnType} onClick={secondBtn?.onClick} />
      </div>
    </div>
  )
}

export default MessageBox
