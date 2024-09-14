import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Header.css";
import { useStateValue } from "../../context/StateProvider";
import ICONS from "../../constants/Icons";
import { t } from "i18next";
import APIEndpoints from "../../constants/APIEndpoints";
import { Link } from "react-router-dom";
import { actionTypes } from "../../context/reducer";
import AvatarLoadingTemplate from "../UI/LoadingTemplate/AvatarLoadingTemplate";
import axiosClient from "../../axios/axios";
import LangBox from "../LangBox/LangBox";
const Header = ({ isDark, darkModeHandler }) => {
  const navigate = useNavigate();
  const [{ authentication }, dispatch] = useStateValue();
  const [avatarLoading, setAvatarLoading] = useState(true)

  useEffect(() => {
    axiosClient.get(APIEndpoints.notifications.countAllUnSeenNotification)
      .then(res => {
        dispatch({
          type: actionTypes.ADD_NOTIFCATION_COUNT,
          payload: {
            notificationCount: res.data,
          }
        })
      })
  }, [])


  return (
    <section className="header_container">

      <div className="header display_flex align_items_center justify_content_end ">
        <div className="display_flex align_items_center ">
          <LangBox />
          <div
            className="dark_mode_toggle header_box_size cursor_pointer display_flex"
            onClick={darkModeHandler}
            title={t("changeTheme")}
          >
            {isDark ? (
              <i className={ICONS.brightnessHigh}></i>
            ) : (
              <i className={ICONS.moon}></i>
            )}
          </div>

          {authentication?.isAuthenticated && (
            <NavLink to="profile" title={t("profile")}>
              <div className="user_profile user_select_none display_flex">
                <div className="user_profile_img_container display_flex position_relative border_radius_50">
                  {avatarLoading && <AvatarLoadingTemplate />}
                  {<img
                    src={
                      authentication.imageUrl
                        ? APIEndpoints.redirecter + authentication.imageUrl
                        : "/public/img/favicon.png"
                    }
                    className="user_profile_img position_absolute"
                    alt="user_image"
                    crossOrigin="anonymous"
                    onLoad={() => setAvatarLoading(false)}
                  />}
                </div>
                <p className="text_color">
                  {authentication.name} {authentication.lastname}
                </p>
              </div>
            </NavLink>
          )}
        </div>
      </div>
    </section>
  );
};

export default Header;
