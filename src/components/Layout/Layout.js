import React, { Suspense, useEffect, useState } from "react";
import Wrapper from "../HOC/Wrapper";
import Header from "../Header/Header";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";
import BreadCrumbs from "../UI/BreadCrumbs/BreadCrumbs";
import Circle from "../UI/Loading/Circle";
import { useStateValue } from "../../context/StateProvider";
import { auth } from "../../constants/FirebaseConfig";
import { actionTypes, getAuthInfoFromLocalStorage } from "../../context/reducer";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Collections from "../../constants/Collections";
import { getUserByEmail } from "../../Utils/FirebaseTools";
import { getDecryptedItem } from "../../Utils/Encryption";

function Layout() {
  const navigate = useNavigate();
  const [{ authentication, smallLoading, navbarCollapse }, dispatch] = useStateValue();
  const checkInterval = 5 * 60 * 1000;  // 5 minutes in milliseconds
  // switch between light or dark mode
  const [isDark, setIsDark] = useState(localStorage.getItem("isDark") === "true");

  const darkModeHandler = () => {
    localStorage.setItem("isDark", !isDark);
    setIsDark(!isDark);
  };


  // Function to check if the user is disabled
  const checkIfUserDisabled = () => {
    const email = authentication.email
    if (!email) {
      dispatch({
        type: actionTypes.LOGOUT,
      });
      dispatch({
        type: actionTypes.HIDE_ASKING_MODAL,
      });
      navigate("/login");
    }
    console.log('start tracking user account email is: ', email);
    getUserByEmail(email).then(user => {
      console.log('ready for checking user account is: ', user.disabled);
      // If the user is disabled, sign them out and redirect
      if (user?.disabled || !user) {
        dispatch({
          type: actionTypes.LOGOUT,
        });
        dispatch({
          type: actionTypes.HIDE_ASKING_MODAL,
        });
        navigate("/login");
      }
    })
  };

  useEffect(() => {

    const intervalId = setInterval(() => {
      checkIfUserDisabled();
    }, checkInterval);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);

  }, [authentication]);


  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && localStorage.length > 0) {
        // Prepare an empty object to hold the decrypted values
        const localStorageAuthObj = {
          isAuthenticated: true,
        };

        // Decrypt each item stored in localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const encryptedKey = localStorage.key(i);
          const decryptedItem = getDecryptedItem(encryptedKey);

          if (decryptedItem) {
            // Store the decrypted value in the object, using the decrypted key
            localStorageAuthObj[decryptedItem.key] = decryptedItem.value;
          }
        }

        // For roles, we need to handle splitting as it was stored as a string
        localStorageAuthObj.roles = localStorageAuthObj.roles ? localStorageAuthObj.roles.split(",") : [];

        // Dispatch only if the authentication state changes
        dispatch({
          type: actionTypes.SET_AUTHENTICATION,
          payload: localStorageAuthObj,
        });
      } else {
        // If user is not authenticated or localStorage is empty, redirect and dispatch logout
        dispatch({
          type: actionTypes.LOGOUT,
        });
        navigate('/login');
      }
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, [dispatch, navigate]);


  console.log('before laout getrendered: ', authentication);


  return (
    <Suspense fallback={<Circle />}>
      <div className={`app ${isDark ? "theme-dark" : "theme-light"}`}>
        <span className="background_colors"></span>
        <main className="main">
          <div id="viewport">
            {authentication.isAuthenticated && (
              <div
                id="navbar_container"
                className={
                  navbarCollapse ? "active_nav_right" : "navbar_translate"
                }
              >
                <Navbar />
              </div>
            )}
            <ErrorBoundary>
              <Wrapper>
                {authentication.isAuthenticated && (
                  <>
                    <Header
                      isDark={isDark}
                      darkModeHandler={darkModeHandler}
                    />
                    <BreadCrumbs />
                  </>
                )}
                <section className="margin_top_20 padding_bottom_10">
                  <Outlet />
                </section>
                {smallLoading && <Circle />}
              </Wrapper>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </Suspense>
  );
}

export default Layout;
