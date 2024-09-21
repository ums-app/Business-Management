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
import { onAuthStateChanged } from "firebase/auth";

function Layout() {
  const navigate = useNavigate();
  const [{ authentication, smallLoading, navbarCollapse }, dispatch] = useStateValue();

  // switch between light or dark mode
  const [isDark, setIsDark] = useState(
    localStorage.getItem("isDark") === "true"
  );

  const darkModeHandler = () => {
    localStorage.setItem("isDark", !isDark);
    setIsDark(!isDark);
  };

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
          roles: localStorage.getItem("roles")?.split(","),
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
