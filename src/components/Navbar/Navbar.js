import React, { useState } from "react";
import { Link, useResolvedPath, useMatch, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useStateValue } from "../../context/StateProvider";
import ICONS from "../../constants/Icons";
import { t } from "i18next";
import { actionTypes } from "../../context/reducer";

const CustomeLinks = ({ to, children, ...props }) => {
  const resolvedPath = useResolvedPath(to);
  let isActive = useMatch({ path: resolvedPath.pathname, end: false });

  // because end is false we need deactive the home tab while other tab is active
  if (to == "/" && window.location.pathname != "/") {
    isActive = false;
  }

  return (
    <li className={"link" + (isActive ? " active " : "")}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
};

const Navbar = () => {
  const [{ authentication, navbarCollapse, }, dispatch] = useStateValue();
  const [activeNav, setActiveNav] = useState(false);
  const navActiveHandler = () => {
    dispatch({
      type: actionTypes.COLLAPSE_NAVBAR,
    })
  };

  const navigate = useNavigate();

  const logoutModal = () => {
    dispatch({
      type: actionTypes.SHOW_ASKING_MODAL,
      payload: {
        show: true,
        message: "logoutMessage",
        btnAction: logout,
        id: null,
      },
    });
  };

  const logout = () => {
    dispatch({
      type: actionTypes.LOGOUT,
    });
    dispatch({
      type: actionTypes.HIDE_ASKING_MODAL,
    });
    navigate("/");
  };

  return (
    <div className={`navbar ${navbarCollapse && " active_nav_right "} display_flex flex_direction_column justify_content_space_between`}>

      <div className="navbar_menu position_absolute">
        <ul className="navbar_content">
          <CustomeLinks to="/" title={t("home")}>
            <i className={ICONS.door}></i>
            <span>{t("home")}</span>
          </CustomeLinks>

          <CustomeLinks to="/dashboard" title={t("dashboard")}>
            <i className={ICONS.dashboard}></i>
            <span>{t("dashboard")}</span>
          </CustomeLinks>

          <CustomeLinks to="/sales" title={t("sales")}>
            <i className={ICONS.card3}></i>
            <span>{t("sales")}</span>
          </CustomeLinks>

          <CustomeLinks to="/buying-products" title={t('purchases')}>
            <i className={ICONS.hangBag}></i>
            <span>{t('purchases')}</span>
          </CustomeLinks>

          <CustomeLinks to="/consumptions" title={t("consumptions")}>
            <i className={ICONS.consumptions}></i>
            <span>{t('consumptions')}</span>
          </CustomeLinks>

          <CustomeLinks to="/depot" title={t("depot")}>
            <i className={ICONS.building}></i>
            <span>{t("depot")}</span>
          </CustomeLinks>

          <CustomeLinks to="/reports" title={t("reports")}>
            <i className={ICONS.reports}></i>
            <span>{t('reports')}</span>
          </CustomeLinks>

          <CustomeLinks to="/products" title={t("products")}>
            <i className={ICONS.stack}></i>
            <span>{t("products")}</span>
          </CustomeLinks>

          <CustomeLinks to="/employees" title={t("employees")}>
            <i className={ICONS.peopleFill}></i>
            <span>{t("employees")}</span>
          </CustomeLinks>

          <CustomeLinks to="/customers" title={t("customers")}>
            <i className={ICONS.personVideo}></i>
            <span>{t("customers")}</span>
          </CustomeLinks>
          <CustomeLinks to="/settings" title={t("settings")}>
            <i className={ICONS.gear}></i>
            <span>{t("settings")}</span>
          </CustomeLinks>

          {/* <CustomeLinks
            className="position_relative"
            to="/notifications"
            title={t("notifications")}>
            <Budget number={notificationCount} left="40px" />
            <i className={ICONS.bell}></i>
            <span>{t("notifications")}</span>
          </CustomeLinks> */}


          <li className="link" onClick={logoutModal} title={t("logout")}>
            <a>
              <i className={ICONS.logout2}></i>
              <span>{t("logout")}</span>
            </a>
          </li>
        </ul>
      </div>


      <div className="toggle_header_navbar position_relative display_flex justify_content_center ">
        <div
          className="toggle_header_icon display_flex align_items_center justify_content_center border_radius_50"
          onClick={navActiveHandler}
          style={{ backgroundColor: navbarCollapse ? 'var(--light-dark)' : 'red' }}
        >
          {navbarCollapse ? (
            <i className={`${ICONS.list} text_color cursor_pointer`}></i>
          ) : (
            <i className={`${ICONS.cross} text_color cursor_pointer bold`} ></i>
          )}
        </div>
      </div>
    </div >
  );
};

export default Navbar;
