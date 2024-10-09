import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Header.css";
import { useStateValue } from "../../context/StateProvider";
import ICONS from "../../constants/Icons";
import { t } from "i18next";
import AvatarLoadingTemplate from "../UI/LoadingTemplate/AvatarLoadingTemplate";
import LangBox from "../LangBox/LangBox";
import { actionTypes } from "../../context/reducer";
const Header = ({ isDark, darkModeHandler }) => {

  const [{ authentication, navbarCollapse }, dispatch] = useStateValue();
  const [avatarLoading, setAvatarLoading] = useState(true)


  const navbarHandler = () => {
    dispatch({
      type: actionTypes.COLLAPSE_NAVBAR,
    })
  }


  return (
    <section className="header_container ">

      <div className="header display_flex align_items_center justify_content_space_between padding_left_10 padding_right_10">
        <div className="toggle_header_navbar position_relative display_flex justify_content_center">
          <div
            className="toggle_header_icon display_flex align_items_center justify_content_center border_radius_50"
            onClick={navbarHandler}
          >
            {navbarCollapse ? (
              <i className={`${ICONS.list} text_color cursor_pointer`}></i>
            ) : (
              <i className={`${ICONS.cross} text_color cursor_pointer`} ></i>
            )}
          </div>
        </div>
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

          {authentication.isAuthenticated && (
            <div className="user_profile user_select_none display_flex">
              <div className="user_profile_img_container display_flex position_relative border_radius_50">
                {avatarLoading && <AvatarLoadingTemplate />}
                {<img
                  src={authentication.imageURL}
                  className="user_profile_img position_absolute"
                  alt="user_image"
                  onLoad={() => setAvatarLoading(false)}
                />}
              </div>
              <p className="text_color">
                {authentication.name} {authentication.lastname}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Header;
