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
    console.log('start tracking user account email is: ', email);
    getUserByEmail(email).then(user => {
      console.log('ready for checking user account is: ', user.disabled);
      // If the user is disabled, sign them out and redirect
      if (user.disabled) {
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

  }, [authentication?.email]);




  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const localStorageAuthObj = {
          isAuthenticated: true,
          name: localStorage.getItem("name"),
          lastname: localStorage.getItem("lastname"),
          email: localStorage.getItem("email"),
          userId: localStorage.getItem("userId"),
          originalEntityId: localStorage.getItem("originalEntityId"),
          imageURL: localStorage.getItem("imageURL"),
          userType: localStorage.getItem("userType"),
          roles: localStorage.getItem("roles") ? localStorage.getItem("roles")?.split(",") : [],
        };

        // Dispatch only if the authentication state changes
        dispatch({
          type: actionTypes.SET_AUTHENTICATION,
          payload: localStorageAuthObj,
        });
      } else {
        // Redirect if the user is not authenticated
        dispatch({
          type: actionTypes.LOGOUT,
        });
        navigate('/login');
      }
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, [dispatch, navigate]);









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
