import { Button } from "@mui/material";
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReactToastify = ({
  toastMsg,
  toastPosition,
  toastAutoClose,
  toastHideProgressBar,
  toastCloseOnClick,
  toastPauseOnHover,
  toastDraggable,
  toastProgress,
  toastTheme,
  toastTextBtn,
}) => {
  const notify = () =>
    toast(toastMsg, {
      position: toastPosition,
      autoClose: toastAutoClose,
      hideProgressBar: toastHideProgressBar,
      closeOnClick: toastCloseOnClick,
      pauseOnHover: toastPauseOnHover,
      draggable: toastDraggable,
      progress: toastProgress,
      theme: toastTheme,
    });
  return (
    <div>
      {/* Call notify from onClick event */}
      <Button onClick={notify}>{toastTextBtn}</Button>
      <ToastContainer />
    </div>
  );
};

export default ReactToastify;
