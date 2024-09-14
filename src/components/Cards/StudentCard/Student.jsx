import React from "react";
import { Link } from "react-router-dom";
import "./Student.css";
import APIEndpoints from "../../../constants/APIEndpoints";
import { t } from "i18next";

const Student = ({ studentInfo, customRef }) => {
  return (
    <div
      className="student box_shadow card border_1px_solid border_radius_10"
      ref={customRef}
    >
      <Link to={"/students-affairs/student-details/" + studentInfo?.id}>
        <div className="student_title_profile position_relative">
          <div className="student_profile_header background_gen_color"></div>
          <div className="student_profile_img display_flex align_items_center justify_content_center">
            <img
              src={APIEndpoints.redirecter + studentInfo?.imageUrl}
              crossOrigin="anonymous"
              alt={studentInfo?.id}
              className="border_radius_50"
            />
          </div>
        </div>

        <div className="student_descriptions">
          <div className="student_personal_info display_flex align_items_center flex_direction_column text_align_center">
            <p>
              <b>
                {studentInfo?.name} {studentInfo?.lastname}
              </b>
            </p>
          </div>
          <div className="student_university_info background_gen_bg_color display_flex align_items_center justify_content_space_around border_radius_8">
            <p>
              <span>
                {studentInfo?.faculty == null ? t("null") : studentInfo.faculty}
              </span>
              <span>{t("faculty")}</span>
            </p>
            <p>
              <span>
                {studentInfo?.department == null
                  ? t("null")
                  : studentInfo.department}
              </span>
              <span>{t("department")}</span>
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Student;
