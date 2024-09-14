import React from "react";
import "./Menu.css";
import ICONS from "../../../constants/Icons";

function Menu({ children, icon = ICONS.threeDotsVerticle, style }) {
  return (
    <div className="menu position_relative" >
      <span className="settings_btn cursor_pointer border_radius_50">
        <i className={icon}></i>
      </span>
      <div
        style={style}
        className="settings_menu position_absolute box_shadow display_flex flex_direction_column justify_content_space_between border_radius_10">
        {children}
      </div>
    </div>
  );
}

export default Menu;
