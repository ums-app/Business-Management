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
import { onMessage } from "firebase/messaging"
import { getToken } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db, messaging } from "./constants/FirebaseConfig"
import Collections from "./constants/Collections"

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
  const [{ authentication },] = useStateValue();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    // Request permission to send notifications
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Get the FCM token
          const token = await getToken(messaging, {
            vapidKey: 'YOUR_VAPID_KEY' // Replace with your Firebase project VAPID key
          });

          if (token) {
            setFcmToken(token);

            // Store the FCM token in Firestore for the Super_Admin
            const superAdminRef = doc(db, Collections.Users, authentication.userId);
            await setDoc(superAdminRef, { fcmToken: token }, { merge: true });

            console.log('FCM Token stored:', token);
          }
        } else {
          console.log('Notification permission denied');
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    const handleIncomingMessage = () => {
      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        // Display notification in the app
        new Notification(payload.notification.title, {
          body: payload.notification.body,
        });
      });
    };

    handleIncomingMessage();
  }, []);


  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err);
        });
    }

  }, [])

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
