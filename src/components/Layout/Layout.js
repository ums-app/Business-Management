import React, { Suspense, useState } from "react";
import Wrapper from "../HOC/Wrapper";
import Header from "../Header/Header";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";
import BreadCrumbs from "../UI/BreadCrumbs/BreadCrumbs";
import Circle from "../UI/Loading/Circle";
import { useStateValue } from "../../context/StateProvider";

function Layout() {
  const [{ smallLoading }, dispatch] = useStateValue();
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
  return (
    <Suspense fallback={<Circle />}>
      <div className={`app ${isDark ? "theme-dark" : "theme-light"}`}>
        <span className="background_colors"></span>
        <main className={`main`}>
          <div id="viewport">
            <div id="navbar_container">
              <Navbar />
            </div>
            <ErrorBoundary>
              <Wrapper>
                <Header isDark={isDark} darkModeHandler={darkModeHandler} />
                {/* <BreadCrumbs /> */}
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
