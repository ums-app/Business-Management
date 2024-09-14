import React from "react";
import "./About.css";
import Footer from "../../components/Footer/Footer";
import Button from "../../components/UI/Button/Button";
import { t } from "i18next";
import ICONS from "../../constants/Icons";
import user from "../../assets/img/user.jpg";

const About = () => {
  return (
    <div className="about">
      {/* About US */}
      <section className="about_us">
        <div className="about_section_title text_align_center">
          <h1>{t("about")}</h1>
        </div>

        <div className="about_us_boxes display_grid">
          <div className="about_us_box">
            <h1>
              <span>{t("introduction")}</span>
              {t("introductionDigital")}
            </h1>
          </div>
          <div className="about_us_box">
            <p>{t("footerHebraText")}</p>
          </div>
          <div className="about_us_box">
            <p>{t("footerHebraText")}</p>
          </div>
        </div>

        <div className="about_us_boxes about_us_boxes2 display_grid">
          <div className="about_us_box2 position_relative display_flex align_items_center justify_content_space_between box_shadow border_radius_10">
            <i className={ICONS.coin}></i>
            <div>
              <h4>{t("bestPriceGuaranteed")}</h4>
              <p>{t("ranText")}</p>
            </div>
          </div>
          <div className="about_us_box2 position_relative display_flex align_items_center justify_content_space_between box_shadow border_radius_10">
            <i className={ICONS.graphUpArrow}></i>
            <div>
              <h4>{t("financeAnalysis")}</h4>
              <p>{t("ranText")}</p>
            </div>
          </div>
          <div className="about_us_box2 position_relative display_flex align_items_center justify_content_space_between box_shadow border_radius_10">
            <i className={ICONS.steam}></i>
            <div>
              <h4>{t("professionalTeam")}</h4>
              <p>{t("ranText")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dev Team */}
      <section className="about_dev_team">
        <div className="about_dev_team_container">
          <div className="about_section_title text_align_center">
            <h1>{t("teamMembers")}</h1>
            <p>{t("footerHebraText")}</p>
          </div>
          <div className="team_boxes display_grid">
            <div className="team_box position_relative text_align_center">
              <img src={user} alt="team" className="box_shadow" />
              <div className="team_layer position_absolute box_shadow border_radius_10">
                <h4>Marouf Ebrahimi</h4>
                <p>Software Engineer</p>
                <div className="team_social">
                  <a href="#">
                    <i className={ICONS.twitter}></i>
                  </a>
                  <a href="https://github.com/maroufebrahimi" target="_blank">
                    <i className={ICONS.github}></i>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/hebra-tech-solutions/about/"
                    target="_blank"
                  >
                    <i className={ICONS.linkedin}></i>
                  </a>
                  <a href="#">
                    <i className={ICONS.instagram}></i>
                  </a>
                </div>
              </div>
            </div>

            <div className="team_box position_relative text_align_center">
              <img src={user} alt="team" className="box_shadow" />
              <div className="team_layer position_absolute box_shadow border_radius_10">
                <h4>Ali Ahmad Herawi</h4>
                <p>Software Engineer</p>
                <div className="team_social">
                  <a href="#" target="_blank">
                    <i className={ICONS.twitter}></i>
                  </a>
                  <a href="https://github.com/aliherawi7" target="_blank">
                    <i className={ICONS.github}></i>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/ali-herawi"
                    target="_blank"
                  >
                    <i className={ICONS.linkedin}></i>
                  </a>
                  <a href="#">
                    <i className={ICONS.instagram}></i>
                  </a>
                </div>
              </div>
            </div>

            <div className="team_box position_relative text_align_center">
              <img src={user} alt="team" className="box_shadow" />
              <div className="team_layer position_absolute box_shadow border_radius_10">
                <h4>Required</h4>
                <p>Front End Developer</p>
                <div className="team_social">
                  <a href="#">
                    <i className={ICONS.twitter}></i>
                  </a>
                  <a href="https://github.com/maroufebrahimi" target="_blank">
                    <i className={ICONS.github}></i>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/hebra-tech-solutions/about/"
                    target="_blank"
                  >
                    <i className={ICONS.linkedin}></i>
                  </a>
                  <a href="#">
                    <i className={ICONS.instagram}></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Contact */}
      <section className="about_contact">
        <div className="about_contact_container">
          <div className="about_section_title text_align_center">
            <h1 className="position_relative">{t("getInTouch")}</h1>
            <p>{t("whatWeDo")}</p>
          </div>

          <div className="about_contact_boxes display_grid">
            <div className="about_contact_box full_width text_align_center box_shadow border_radius_8">
              <i className={ICONS.geoAlt}></i>
              <h4>Our Address</h4>
              <p>M8 Shirzay Street, Herat, NY 535022</p>
            </div>
            <div className="about_contact_box text_align_center box_shadow border_radius_8">
              <i className={ICONS.envelope}></i>
              <h4>Email Us</h4>
              <p>hebraTech@gmail.com</p>
            </div>
            <div className="about_contact_box text_align_center box_shadow border_radius_8">
              <i className={ICONS.telephone}></i>
              <h4>Call Us</h4>
              <p>+93 2299 5540 01</p>
            </div>
          </div>

          <div className="about_form position_relative display_grid">
            <iframe
              className="border_radius_8"
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d37260.147235800476!2d62.22810267995726!3d34.36669054583455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1710539628912!5m2!1sen!2s"
              style={{ border: "0", width: "100%", height: "384px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              frameBorder="0"
            ></iframe>

            <form className="display_grid border_radius_8 box_shadow">
              <input
                className="input"
                type="text"
                placeholder={t("name")}
                required
              />
              <input
                className="input"
                type="email"
                placeholder={t("email")}
                required
              />
              <input
                className="full_width input"
                type="text"
                placeholder={t("subject")}
                required
              />
              <textarea
                className="full_width input"
                cols="10"
                rows="3"
                placeholder={t("message")}
              ></textarea>
              <Button text={`${t("send")} ${t("message")}`} />
            </form>
          </div>
        </div>
      </section>

      {/* Footer  */}
      <Footer />
    </div>
  );
};

export default About;
