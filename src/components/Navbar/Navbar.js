import React, { useState } from "react";
import { Link, useResolvedPath, useMatch, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useStateValue } from "../../context/StateProvider";
import ICONS from "../../constants/Icons";
import { t } from "i18next";
import { actionTypes } from "../../context/reducer";
import { Tooltip } from "react-tooltip";
import { UserTypes } from "../../constants/Others";

const CustomeLinks = ({ to, id, children, ...props }) => {
  const resolvedPath = useResolvedPath(to);
  let isActive = useMatch({ path: resolvedPath.pathname, end: false });

  // because end is false we need deactive the home tab while other tab is active
  if (to == "/" && window.location.pathname != "/") {
    isActive = false;
  }

  return (
    <li className={"link" + (isActive ? " active " : "")} id={id}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
};

const Navbar = () => {
  const [{ authentication, navbarCollapse, }, dispatch] = useStateValue();
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

      {/* for admin user */}
      {authentication.userType == UserTypes.EMPLOYEE || authentication.userType == 'SUPER_ADMIN' &&
        <div className="navbar_menu position_absolute">
          <ul className="navbar_content">
            <CustomeLinks to="/" id={'home_link'} >
              <i className={ICONS.door}></i>
              <span>{t("home")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#home_link"
              place="left"
              className="toolTip_style"
            >
              {t("home")}
            </Tooltip>

            <CustomeLinks to="/dashboard" id={'dashboard_link'}>
              <i className={ICONS.dashboard}></i>
              <span>{t("dashboard")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#dashboard_link"
              place="left"
              className="toolTip_style"
            >
              {t("dashboard")}
            </Tooltip>

            <CustomeLinks to="/sales" id={'sales_link'}>
              <i className={ICONS.card3}></i>
              <span>{t("sales")}</span>
            </CustomeLinks>

            <Tooltip
              anchorSelect="#sales_link"
              place="left"
              className="toolTip_style"
            >
              {t("sales")}
            </Tooltip>


            <CustomeLinks to="/purchase-products" id={'purchases_link'}>
              <i className={ICONS.hangBag}></i>
              <span>{t('purchases')}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#purchases_link"
              place="left"
              className="toolTip_style"
            >
              {t("purchases")}
            </Tooltip>


            <CustomeLinks to="/consumptions" id={'consumptions_link'}>
              <i className={ICONS.consumptions}></i>
              <span>{t('consumptions')}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#consumptions_link"
              place="left"
              className="toolTip_style"
            >
              {t("consumptions")}
            </Tooltip>

            <CustomeLinks to="/depot" id={'depot_link'}>
              <i className={ICONS.building}></i>
              <span>{t("depot")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#depot_link"
              place="left"
              className="toolTip_style"
            >
              {t("depot")}
            </Tooltip>

            <CustomeLinks to="/reports" id={'reports_link'}>
              <i className={ICONS.reports}></i>
              <span>{t('reports')}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#reports_link"
              place="left"
              className="toolTip_style"
            >
              {t("reports")}
            </Tooltip>

            <CustomeLinks to="/products" id={'products_link'}>
              <i className={ICONS.stack}></i>
              <span>{t("products")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#products_link"
              place="left"
              className="toolTip_style"
            >
              {t("products")}
            </Tooltip>


            <CustomeLinks to="/employees" id={'employees_link'}>
              <i className={ICONS.peopleFill}></i>
              <span>{t("employees")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#employees_link"
              place="left"
              className="toolTip_style"
            >
              {t("employees")}
            </Tooltip>

            <CustomeLinks to="/customers" id={'customers_link'}>
              <i className={ICONS.personVideo}></i>
              <span>{t("customers")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#customers_link"
              place="left"
              className="toolTip_style"
            >
              {t("customers")}
            </Tooltip>
            <CustomeLinks to="/backup" id={'backup_link'}>
              <i className={ICONS.arrowDown}></i>
              <span>{t("backup")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#backup_link"
              place="left"
              className="toolTip_style"
            >
              {t("backup")}
            </Tooltip>

            <CustomeLinks to="/settings" id={'settings_link'}>
              <i className={ICONS.gear}></i>
              <span>{t("settings")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#settings_link"
              place="left"
              className="toolTip_style"
            >
              {t("settings")}
            </Tooltip>

            {/* <CustomeLinks
            className="position_relative"
            to="/notifications"
            title={t("notifications")}>
            <Budget number={notificationCount} left="40px" />
            <i className={ICONS.bell}></i>
            <span>{t("notifications")}</span>
          </CustomeLinks> */}


            <li className="link" onClick={logoutModal} id={"logout"}>
              <a>
                <i className={ICONS.logout2}></i>
                <span>{t("logout")}</span>
              </a>
            </li>

            <Tooltip
              anchorSelect="#logout"
              place="left"
              className="toolTip_style"
            >
              {t("logout")}
            </Tooltip>
          </ul>
        </div>
      }


      {/* for customer */}
      {UserTypes?.VISITOR?.toLowerCase() == authentication?.userType?.toLowerCase() &&
        <div className="navbar_menu position_absolute">
          <ul className="navbar_content">
            <CustomeLinks to="/" id={'home_link'} >
              <i className={ICONS.door}></i>
              <span>{t("home")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#home_link"
              place="left"
              className="toolTip_style"
            >
              {t("home")}
            </Tooltip>

            <CustomeLinks to="/visitor-factors" id={'purchases_link'}>
              <i className={ICONS.hangBag}></i>
              <span>{t('sales')}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#purchases_link"
              place="left"
              className="toolTip_style"
            >
              {t("sales")}
            </Tooltip>

            <CustomeLinks to="/products" id={'products_link'}>
              <i className={ICONS.stack}></i>
              <span>{t("products")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#products_link"
              place="left"
              className="toolTip_style"
            >
              {t("products")}
            </Tooltip>

            <CustomeLinks to="/visitor-customers" id={'customers_link'}>
              <i className={ICONS.personVideo}></i>
              <span>{t("customers")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#customers_link"
              place="left"
              className="toolTip_style"
            >
              {t("customers")}
            </Tooltip>

            <CustomeLinks to="/visitor-receipts" id={'customers_link'}>
              <i className={ICONS.coin}></i>
              <span>{t("receipts")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#customers_link"
              place="left"
              className="toolTip_style"
            >
              {t("receipts")}
            </Tooltip>
            <CustomeLinks to="/visitor-salaries" id={'customers_link'}>
              <i className={ICONS.personVideo}></i>
              <span>{t("salaries")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#customers_link"
              place="left"
              className="toolTip_style"
            >
              {t("salaries")}
            </Tooltip>

            <CustomeLinks to="/visitor-information" id={'customers_link'}>
              <i className={ICONS.personVideo}></i>
              <span>{t("personalInformation")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#customers_link"
              place="left"
              className="toolTip_style"
            >
              {t("personalInformation")}
            </Tooltip>

            {/* <CustomeLinks to="/settings" id={'settings_link'}>
              <i className={ICONS.gear}></i>
              <span>{t("settings")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#settings_link"
              place="left"
              className="toolTip_style"
            >
              {t("settings")}
            </Tooltip> */}

            <li className="link" onClick={logoutModal} id={"logout"}>
              <a>
                <i className={ICONS.logout2}></i>
                <span>{t("logout")}</span>
              </a>
            </li>

            <Tooltip
              anchorSelect="#logout"
              place="left"
              className="toolTip_style"
            >
              {t("logout")}
            </Tooltip>
          </ul>
        </div>

      }


      {/* for customer */}
      {UserTypes.CUSTOMER?.toLowerCase() == authentication?.userType?.toLowerCase() &&
        <div className="navbar_menu position_absolute">
          <ul className="navbar_content">
            <CustomeLinks to="/" id={'home_link'} >
              <i className={ICONS.door}></i>
              <span>{t("home")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#home_link"
              place="left"
              className="toolTip_style"
            >
              {t("home")}
            </Tooltip>

            <CustomeLinks to="/customer-factors" id={'purchases_link'}>
              <i className={ICONS.hangBag}></i>
              <span>{t('purchases')}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#purchases_link"
              place="left"
              className="toolTip_style"
            >
              {t("purchases")}
            </Tooltip>


            <CustomeLinks to="/products" id={'products_link'}>
              <i className={ICONS.stack}></i>
              <span>{t("products")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#products_link"
              place="left"
              className="toolTip_style"
            >
              {t("products")}
            </Tooltip>



            <CustomeLinks to="/customer-payments" id={'customers_link'}>
              <i className={ICONS.personVideo}></i>
              <span>{t("payments")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#customers_link"
              place="left"
              className="toolTip_style"
            >
              {t("payments")}
            </Tooltip>


            <CustomeLinks to="/customer-information" id={'customers_link'}>
              <i className={ICONS.personVideo}></i>
              <span>{t("personalInformation")}</span>
            </CustomeLinks>
            <Tooltip
              anchorSelect="#customers_link"
              place="left"
              className="toolTip_style"
            >
              {t("personalInformation")}
            </Tooltip>


            <li className="link" onClick={logoutModal} id={"logout"}>
              <a>
                <i className={ICONS.logout2}></i>
                <span>{t("logout")}</span>
              </a>
            </li>

            <Tooltip
              anchorSelect="#logout"
              place="left"
              className="toolTip_style"
            >
              {t("logout")}
            </Tooltip>
          </ul>
        </div>

      }




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
