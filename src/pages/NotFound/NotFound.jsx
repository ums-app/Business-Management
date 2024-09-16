import React from "react";
import "./NotFound.css";
import { Link, useNavigate } from "react-router-dom";
import { t } from "i18next";
import Button from "../../components/UI/Button/Button"
import ICONS from "../../constants/Icons";

const NotFound = () => {
  const nav = useNavigate();
  return (
    <div className="not_found display_flex margin_top_20" >
      <h1>404</h1>
      <p>{t("notFoundMsg")}</p>


      <div className="nav_btn_container display_flex ">

        <Button
          onClick={() => nav(-1)}
          text={t('previousPage')}
          type={'margin_10'}
          icon={ICONS.back}
        />
        <Button
          onClick={() => nav('/')}
          text={t("home")}
          icon={ICONS.door}
          type={' margin_10'}
        />
      </div>
    </div>
  );
};

export default NotFound;
