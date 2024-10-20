import React, { useEffect, useState } from "react"
import { RouterProvider } from "react-router-dom"
import browserRouter from "./route/routerProvider"
import "./App.css"
import reducer, { actionTypes } from "./context/reducer"
import BackDrop from "./components/UI/BackDrop/BackDrop"
import { useStateValue } from "./context/StateProvider"
import MessageBox from "./components/UI/MessageBox/MessageBox"
import { t } from "i18next"
import BtnTypes from "./constants/BtnTypes"
import ICONS from "./constants/Icons"
import "./index.css"
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import RestrictWarning from "./components/UI/RestrictWarning/RestrictWarning"
import Circle from "./components/UI/Loading/Circle"

const App: React.FC = () => {
  const [{ askingModal, locale, restrictWarning, confirmModal, globalLoading }, dispatch] = useStateValue();

  const hideShowAskingModal = () => {
    dispatch({
      type: actionTypes.SHOW_ASKING_MODAL,
      payload: { show: false, message: '' },
    })
  }
  const hideConfirmMessage = () => {
    dispatch({
      type: actionTypes.HIDE_CONFIRM_MODAL,
    })
  }

  return (
    <div id="ums_app">
      <BackDrop show={askingModal.show}>
        {
          <MessageBox
            messageType="asking"
            firstBtn={{
              btnText: t("yes"),
              btnType: BtnTypes.danger,
              onClick: () => askingModal.btnAction(askingModal.id),
            }}
            secondBtn={{
              btnText: t("no"),
              btnType: BtnTypes.success,
              onClick: hideShowAskingModal,
            }}
            message={t(askingModal.message)}
            iconType={ICONS.asking}
          />
        }
      </BackDrop>

      {/* modal for restrict mode */}
      <BackDrop show={restrictWarning?.show}>
        <RestrictWarning confirmHandler={restrictWarning?.confirmHandler} />
      </BackDrop>

      <BackDrop show={confirmModal.show}>
        {
          <MessageBox
            messageType="info"
            firstBtn={{
              btnText: t("confirm"),
              btnType: BtnTypes.success,
              onClick: hideConfirmMessage,
            }}
            message={confirmModal.message}
            iconType={confirmModal.iconType}
          />
        }
      </BackDrop>
      {globalLoading ? <Circle /> : null}

      {/*  toast configuration */}
      <ToastContainer
        position={locale == 'en' ? "bottom-right" : "bottom-left"}
        pauseOnHover={true}
        closeOnClick={true}
        draggable={true}
        hideProgressBar={false}
        autoClose={4000}
      />

      <RouterProvider router={browserRouter} />
    </div>
  )
}

export default App
