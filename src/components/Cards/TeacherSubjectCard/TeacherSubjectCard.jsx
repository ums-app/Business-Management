import { t } from "i18next";
import React from "react";
import ICONS from "../../../constants/Icons";
import Menu from "../../UI/Menu/Menu";
import Button from "../../UI/Button/Button";
import "./TeacherSubjectCard.css";

const TeacherSubjectCard = ({ subject, handleDelete, teacherMode = false }) => {
  return (
    <div
      key={subject.id}
      className="teacher_subject_card card card_preview_fa_dep border_radius_10"
    >
      <div className="teacher_subject_card_menu display_flex align_items_center justify_content_end">
        {!teacherMode && (
          <Menu>
            <Button
              icon={ICONS.trash}
              text={t("delete")}
              onClick={handleDelete}
            />
          </Menu>
        )}
      </div>
      <div className="teacher_subject_card_details ">
        <p className="bold text_align_center title_2">{subject.name}</p>
        <div className="border_1px_solid border_radius_10">
          <div className="display_flex padding_10">
            <div className="display_flex flex_direction_column text_align_center justify_content_center">
              <span className="bold">{t("className")}</span>
              <span>{subject.classDetails.name}</span>
            </div>
          </div>
          <div className="teacher_subject_card_sem_credits display_flex justify_content_space_between padding_10 ">
            <div className="display_flex flex_direction_column text_align_center justify_content_center">
              <span className="bold">{t("semester")}</span>
              <span>{subject.classDetails.semester}</span>
            </div>
            <div className="display_flex flex_direction_column text_align_center justify_content_center">
              <span className="bold">{t("total") + " " + t("credits")}</span>
              <span>{subject.credit}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSubjectCard;
