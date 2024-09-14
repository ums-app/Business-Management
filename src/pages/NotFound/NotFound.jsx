import React from "react";
import "./NotFound.css";
import { Link } from "react-router-dom";
import { t } from "i18next";

const NotFound = () => {
  return (
    <div className="not_found display_flex margin_top_20" >
      <h1>404</h1>
      <p>{t("notFoundMsg")}</p>
      <button className="btn">
        <Link to="/">{t("backToHome")}</Link>
      </button>
    </div>
  );
};

export default NotFound;
