import React, { useState, useEffect, useRef } from "react";
import "./Wrapper.css";
import ICONS from "../../constants/Icons";
import { useParams } from "react-router-dom";
import useOnline from "../../Hooks/useOnline";
import { t } from "i18next";

const Wrapper = (props) => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const wrapperRef = useRef(null);
  const { id } = useParams();

  const isOnline = useOnline();

  useEffect(() => {
    const wrapper = wrapperRef.current;

    const handleScroll = () => {
      // Check if wrapper has been scrolled more than 200 pixels
      if (wrapper.scrollTop > 200) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    // Add event listener to wrapper to check if it has been scrolled
    wrapper.addEventListener("scroll", handleScroll);

    // Cleanup function to remove event listener when component unmounts
    return () => {
      wrapper.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    handleBackToTop();
  }, [id]);

  const handleBackToTop = () => {
    // Scroll to top of wrapper
    const wrapper = wrapperRef.current;
    wrapper.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="wrapper box_sizing_border_box"
      id="wrapper"
      ref={wrapperRef}
    >
      <div className="body_container">
        {/* display modal for offline */}
        {!isOnline && (
          <div className="internet_status fade_in">
            <i className={ICONS.dangerFill}></i>
            <span>{t("offline")}</span>
          </div>
        )}
        {showBackToTop && (
          <div
            className={`back_to_top position_fixed display_flex ${
              showBackToTop ? "fade_in" : "fade_out"
            }`}
          >
            <button
              onClick={handleBackToTop}
              className="display_flex align_items_center justify_content_center cursor_pointer border_none outline_none background_gen_bg_color border_radius_50"
            >
              <i className={`${ICONS.arrowUpShort} text_color`}></i>
            </button>
          </div>
        )}
        {props.children}
      </div>
    </div>
  );
};

export default Wrapper;
