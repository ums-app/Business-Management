import React, { useState } from "react";
import ICONS from "../../../constants/Icons";
import "./StarRating.css";
import { t } from "i18next";

const StarRating = ({ rating, setRating }) => {
  const [mouseHover, setMouseHover] = useState(undefined);

  const starStatus =
    mouseHover == 5 || rating == 5
      ? t("excellent")
      : mouseHover == 4 || rating == 4
        ? t("good")
        : mouseHover == 3 || rating == 3
          ? t("okay")
          : mouseHover == 2 || rating == 2
            ? t("bad")
            : mouseHover == 1 || rating == 1
              ? t("veryBad")
              : "";

  return (
    <div className="star_rating">
      {[...Array(5)].map((star, index) => {
        index += 1;
        return (
          <span
            key={index}
            className={index <= (rating || mouseHover) ? "on" : "off"}
            onClick={() => setRating(index)}
            onMouseOver={() => setMouseHover(index)}
            onMouseLeave={() => setMouseHover(undefined)}
          >
            <i className={ICONS.star}></i>
          </span>
        );
      })}
      <p className={"text_align_center"} style={{ height: '15px' }}>{starStatus}</p>
    </div>
  );
};

export default StarRating;
