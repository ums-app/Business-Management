import { t } from "i18next";
import React from "react";
import "./TeacherCard.css";
import { Link } from "react-router-dom";
import "../StudentCard/Student.css";
import ReviewStars from "../../UI/ReviewStars/ReviewStars";

function TeacherCard({
  id,
  imageUrl = "a",
  name,
  lastName,
  fieldOfStudy,
  starRate,
  totalReviews,
  link = "teachers/teacher-details/",
  customRef,
}) {
  return (
    <div
      className="teacher_card card box_shadow border_1px_solid border_radius_10"
      ref={customRef}
    >
      <Link to={link + id}>
        <div className="student_title_profile position_relative">
          <div className="student_profile_header background_gen_color"></div>
          <div className="student_profile_img display_flex align_items_center justify_content_center">
            <img
              src={imageUrl}
              crossOrigin="anonymous"
              alt={name}
              className="border_radius_50"
            />
          </div>
        </div>

        <div className="student_descriptions">
          <div className="student_personal_info display_flex align_items_center flex_direction_column text_align_center">
            <p>
              <b>
                {name} {lastName}
              </b>
            </p>
          </div>
          <div className="student_university_info background_gen_bg_color display_flex align_items_center justify_content_space_around border_radius_8">
            <p>
              <span>{t("fieldOfStudy")}</span>
              <span>{fieldOfStudy}</span>
            </p>
            <ReviewStars totalStars={starRate} reviews={totalReviews} />
          </div>
        </div>
      </Link>
    </div>
  );
}

export default TeacherCard;
