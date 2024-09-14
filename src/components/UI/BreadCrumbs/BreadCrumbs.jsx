import React from "react";
import useBreadcrumbs from "use-react-router-breadcrumbs";
import "./BreadDrumbs.css";
import { NavLink, useNavigate } from "react-router-dom";
import ICONS from "../../../constants/Icons";
import Button from "../Button/Button";
import { t } from "i18next";

const BreadCrumbs = () => {
  const breadcrumbs = useBreadcrumbs();
  const navigate = useNavigate();
  if (breadcrumbs.length == 1) {
    return;
  }

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="breadcrumbs display_flex justify_content_space_between">
      <div className="display_flex ">
        {breadcrumbs.map(({ match, breadcrumb }, index) => {
          return (
            <span
              className={"bread_drumb_item"}
              key={index}
            >
              {match.pathname == "/" ? (
                <i className={ICONS.door}></i>
              ) : (
                breadcrumb.props.children
                  .split(" ")
                  .map((word) => t(word.toLowerCase()) + " ")
              )}{" "}
            </span>
          );
        })}
      </div>
      <Button icon={ICONS.back} onClick={goBack} />
    </div>
  );
};

export default BreadCrumbs;
