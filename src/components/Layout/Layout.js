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
  const [{ authentication, smallLoading, navbarCollapse }, dispatch] = useStateValue();

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
    onAuthStateChanged(auth, (currentUsero) => {
      // console.log(currentUser);
      if (!currentUsero) {
        navigate('/login')
      }
    });

  }, [auth])

  // if (!currentUser) {
  //   return <Circle />
  // }

  console.log(authentication);


  return (
    <Suspense fallback={<Circle />}>
      <div className={`app ${isDark ? "theme-dark" : "theme-light"}`}>
        <span className="background_colors"></span>
        <main className={`main`}>
          <div id="viewport">
            {authentication.isAuthenticated &&
              <div id="navbar_container" className={navbarCollapse ? 'active_nav_right' : 'navbar_translate'}>
                <Navbar />
              </div>
            }
            <ErrorBoundary>
              <Wrapper>
                {authentication.isAuthenticated && <Header isDark={isDark} darkModeHandler={darkModeHandler} />}
                {authentication.isAuthenticated && <BreadCrumbs />}
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
