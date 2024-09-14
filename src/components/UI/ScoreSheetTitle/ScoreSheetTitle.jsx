import React from "react";
import { t } from "i18next";
import "./ScoreSheetTitle.css";
import DisplayLogo from "../DisplayLogo/DisplayLogo";

const ScoreSheetTitle = ({ scoreSheet }) => {
  // score sheet header data
  const headerData = [
    { label: "department", value: "دیتابیس" },
    { label: "semester", value: "چهارم" },
    { label: "class", value: "دوم" },
    { label: "subject", value: "دیتا استرکچر" },
    { label: "credits", value: "4" },
    { label: "teacher", value: "معروف ابراهیمی" },
    { label: "auditor", value: "معروف ابراهیمی" },
    { label: "date", value: "1403/03/01" },
  ];

  return (
    <>
      <div className="score_sheet_title">
        <div className="score_sheet_title_box">
          <DisplayLogo
            imgURL={scoreSheet?.universityLogoUrl}
            alt={"University logo"}
          />
        </div>
        <div className="score_sheet_title_box">
          <p>{t("ministry")}</p>
          <p>{t("privateStudentAffairs")}</p>
          <p>{t("hariwaInstitute")}</p>
          <p>{t("studentAffairs")}</p>
          <p>{t("semesterResults")}</p>
          <p>{t("compSciFaculty")}</p>
          <p>{t("spring1403")}</p>
        </div>
        <div className="score_sheet_title_box">
          <DisplayLogo
            imgURL={scoreSheet?.facultyLogoUrl}
            alt={"faculty logo"}
          />
        </div>
      </div>
      {/* score sheet header */}
      <div className="score_sheet_header">
        {headerData.map((item, index) => (
          <div key={index} className="score_sheet_header_box">
            <span>{t(item.label)}</span>: <span>{item.value}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default ScoreSheetTitle;
