import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";
import ICONS from "../../constants/Icons";
import { t } from "i18next";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer_boxes">
        <div className="footer_box first_footer_box">
          <h1 className="text_color">HebraTech Solutions Company </h1>
          <p className="text_color">{t("footerHebraText")}</p>
        </div>

        <div className="footer_box footer_box_nav display_flex flex_direction_column">
          <h2>{t("navigation")}</h2>
          <Link to="/">{t("home")}</Link>
          <Link to="/">{t("about")}</Link>
          <Link to="/">{t("settings")}</Link>
        </div>

        <div className="footer_box footer_contactUs">
          <h2>{t("contactUs")}</h2>
          <div>
            <p>
              <span>
                <i className={ICONS.telephoneFill}></i>
              </span>
              <span>+93 799 123 456</span>
            </p>
            <p>
              <span>
                <i className={ICONS.envelopeFill}></i>
              </span>
              <span>hebraTech@gmail.com</span>
            </p>
            <p>
              <span>
                <i className={ICONS.clockFill}></i>
              </span>
              <span>Sat - Thu 8:00 - 5:00</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Social Media */}
      <div className="footer_social_media">
        <ul className="display_flex">
          <li>
            <a
              href="https://www.linkedin.com/company/hebra-tech-solutions/about/"
              target="_blank"
            >
              <i className={ICONS.linkedin}></i>
            </a>
          </li>
          <li title="انستاگرام">
            <a href="" target="_blank">
              <i className={ICONS.instagram}></i>
            </a>
          </li>
          <li>
            <a href="" target="_blank">
              <i className={ICONS.twitter}></i>
            </a>
          </li>
          <li title="تلگرام">
            <a href="" target="_blank">
              <i className={ICONS.telegram}></i>
            </a>
          </li>
          <li title="فیسبوک">
            <a href="" target="_blank">
              <i className={ICONS.facebook}></i>
            </a>
          </li>
        </ul>
      </div>
      {/* !CopyRight */}
      <div className="copyright">
        <div className="credits">
          <p className="text_color text_align_center">{t("atCopyRight")}</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
