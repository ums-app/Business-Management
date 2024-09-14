import { t } from "i18next";
import React from "react";
import "../StudentCard/Student.css";
import APIEndpoints from "../../../constants/APIEndpoints";
import { Link } from "react-router-dom";

function StaffCard({ staffInfo, customRef }) {
  return (
    <div
      className="teacher_card card box_shadow border_1px_solid border_radius_10"
      ref={customRef}
    >
      <Link to={"/staffs/staff-details/" + staffInfo?.id}>
        <div className="student_title_profile position_relative">
          <div className="student_profile_header background_gen_color"></div>
          <div className="student_profile_img display_flex align_items_center justify_content_center">
            <img
              src={APIEndpoints.redirecter + staffInfo?.imageUrl}
              crossOrigin="anonymous"
              alt={staffInfo?.name}
              className="border_radius_50"
            />
          </div>
        </div>

        <div className="student_descriptions">
          <div className="student_personal_info display_flex align_items_center flex_direction_column text_align_center">
            <p>
              <b>
                {staffInfo?.name} {staffInfo?.lastName}
              </b>
            </p>
          </div>
          <div className="student_university_info background_gen_bg_color display_flex align_items_center justify_content_space_around border_radius_8">
            <p>
              <span>{t("systemGeneratedCode")}</span>
              <span>{staffInfo?.systemGeneratedCode}</span>
            </p>
            <p>
              <span>{t("status")}</span>
              <span>{staffInfo.system ? t("active") : t("deactive")}</span>
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
export default StaffCard;
