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
import { onAuthStateChanged } from "firebase/auth";

function Layout() {
  const navigate = useNavigate()
  const [{ smallLoading }, dispatch] = useStateValue();
  const [currentUser, setCurrentUser] = useState()
  // switch between light or dark mode
  const [isDark, setIsDark] = useState(
    localStorage.getItem("isDark") == null
      ? false
      : localStorage.getItem("isDark") == "true"
        ? true
        : false
  );

  const darkModeHandler = () => {
    localStorage.setItem("isDark", !isDark);
    setIsDark(!isDark);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // setUser(currentUser);  // User is logged in
        setCurrentUser(currentUser)
        navigate('/')
      } else {
        //setUser(null);  // User is logged out
        navigate('/login')
      }
    });

  }, [auth])


  console.log(auth);


  return (
    <Suspense fallback={<Circle />}>
      <div className={`app ${isDark ? "theme-dark" : "theme-light"}`}>
        <span className="background_colors"></span>
        <main className={`main`}>
          <div id="viewport">
            {currentUser &&
              <div id="navbar_container">
                <Navbar />
              </div>
            }
            <ErrorBoundary>
              <Wrapper>
                {currentUser && <Header isDark={isDark} darkModeHandler={darkModeHandler} />}
                <BreadCrumbs />
                <section className="margin_top_20">
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
