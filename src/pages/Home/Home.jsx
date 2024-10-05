import React, { useState, useEffect } from "react";
import { useStateValue } from "../../context/StateProvider";
import "./Home.css";
import Footer from "../../components/Footer/Footer";
import { eliteStudents } from "../../constants/Data";
import { colleagueInstitute } from "../../constants/Data";
import APIEndpoints from "../../constants/APIEndpoints";
import { t } from "i18next";
import ICONS from "../../constants/Icons";
import TeacherHome from "../Teachers/TeacherHome/TeacherHome";
import StudentHome from "../Students/StudentHome/StudentHome";
import DisplayLogo from "../../components/UI/DisplayLogo/DisplayLogo";

const Home = () => {
  const [{ authentication }, dispatch] = useStateValue();

  // img test
  const images = [
    { img: "./img/cs.png" },
    { img: "./img/law.png" },
    { img: "./img/sto.png" },
    { img: "./img/cs.png" },
  ];

  const [fields, setFields] = useState([]);
  useEffect(() => {
    fetch(APIEndpoints.root + APIEndpoints.fieldOfStudy.getAll)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error(res.statusText);
        }
      })
      .then((data) => {
        setFields(data.content);
      });
  }, []);

  if (authentication?.roles?.includes("TEACHER")) {
    return <TeacherHome />;
  }
  if (authentication?.roles?.includes("STUDENT")) {
    return <StudentHome />;
  }

  return (
    <div className="home fade_in">
      {/* Main Show Slider */}
      {/* End of Main Show Slider */}

      <section className="statistics section_title">
        <p className="title">{t("statistics")}</p>
        <div className="statistics_boxes display_grid">
          <div className="statistics_card display_flex flex_direction_column">
            <i className={ICONS.student}></i>
            <span className="statistics_title">Total Students</span>
            <span className="statistics_value">123123</span>
          </div>
          <div className="statistics_card display_flex flex_direction_column">
            <i className={ICONS.people}></i>
            <span className="statistics_title">Total Teachers</span>
            <span className="statistics_value">123</span>
          </div>
          <div className="statistics_card display_flex flex_direction_column">
            <i className={ICONS.faculty}></i>
            <span className="statistics_title">Total Faculties</span>
            <span className="statistics_value">13</span>
          </div>
        </div>
      </section>

      {/* Faculties */}
      <section className="hariwa_faculties fade_in">
        <div className="section_title">
          <p className="title">{t("faculties")}</p>
        </div>
        <div className="faculty_boxes display_grid text_align_center">
          {fields.map((f, index) => {
            return (
              <div className="faculty_box display_flex flex_direction_column align_items_center" key={f.id}>
                <DisplayLogo imgURL={f.logoUrl} />
                <h3>{f.facultyName}</h3>
                <span>230</span>
              </div>
            );
          })}
        </div>
      </section>
      {/* End of Faculties */}

      {/* Elite Students */}
      <section className="elite_students fade_in">
        <div className="section_title">
          <p className="title">{t("eliteStudents")}</p>
        </div>
        <div className="elite_stu display_grid">
          {eliteStudents.map((item) => (
            <div className="elite_stu_card" key={item.id}>
              <div className="elite_stu_card_text box_shadow">
                <p>{item.text}</p>
              </div>
              <div className="elite_stu_card_personalInfo">
                <img className="box_shadow" src={item.eliteImg} alt="" />
                <p>{item.eliteName}</p>
                <p>{item.studentsOf}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* End of Elite Students */}

      {/* Colleague Institute */}
      <section className="colleague_institute fade_in">
        <div className="section_title">
          <p className="title">{t("partnerInstitutions")}</p>
        </div>
        <div className="colleague_institute_boxes display_grid">
          {colleagueInstitute.map((itemImg) => (
            <div
              key={itemImg.id}
              className="colleague_institute_box display_flex align_items_center justify_content_center"
              title={itemImg.title}
            >
              <img src={itemImg.imgInstitute} alt={itemImg.alt} />
            </div>
          ))}
        </div>
      </section>
      {/* End of Colleague Institute */}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
