import React from "react";
import "./Modal.css";
import ICONS from "../../../constants/Icons";

export default function Modal({ show, modalClose, children }) {
  if (!show) return null;

  return (
    <>
      <div className="modal_backdrop display_flex align_items_center justify_content_center" >
        <div className="modal top_to_center" onClick={e => e.stopPropagation()}>
          <div onClick={modalClose} className="close_modal cursor_pointer">
            <i className={ICONS.cross}></i>
          </div>
          <div className="modal_children ">{children}</div>
        </div>
      </div>

    </>
  );
}
