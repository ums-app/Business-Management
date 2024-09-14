
import React from "react";
import ICONS from "../../../constants/Icons";
import "./ReviewStars.css";

const ReviewStars = ({ totalStars = 0, reviews = null }) => {
  if (Number.isNaN(totalStars)) {
    return null;
  }

  const filledStars = [...Array(totalStars)];
  const emptyStars = [...Array(5 - totalStars)];


  Array()
  return (
    <div className="star_rating">
      {filledStars.map((el, index) => {
        index += 1;
        return (
          <span
            key={index + 10}
            className={"on"}
          >
            <i className={ICONS.star}></i>
          </span>
        );
      })}
      {emptyStars.map((el, index) => {
        return (
          <span
            key={index}
            className={"off"}
          >
            <i className={ICONS.star}></i>
          </span>
        );
      })}
      {reviews != null && <span style={{ margin: "0 4px" }}>({reviews})</span>}
    </div>
  );
};

export default ReviewStars;

