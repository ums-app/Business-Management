import React from "react";
import "./NotFoundUI.css";

const NotFoundUI = () => {
  return (
    <div className="display_flex justify_content_center align_items_center flex_direction_column">
      <h1 className="not_found_ui_heading">404</h1>
      <p className="not_found_ui_description">
        We're sorry, but the page you were looking for doesn't exist.
      </p>
    </div>
  );
};

export default NotFoundUI;
