import { t } from "i18next";
import React from "react";
import { Tooltip } from "react-tooltip";

const UserProfile = ({ imageUrl, name, lastName }) => {
  return (
    <div
      className="display_flex align_items_center user_select_none gap_10"
      id="user-profile-tooltip"
    >
      <img
        src={imageUrl}
        className="user_profile_img"
        alt={`${name} ${lastName}`}
      />
      <span>{`${name} ${lastName}`}</span>

      <Tooltip
        anchorSelect="#user-profile-tooltip"
        place="bottom"
        delayShow={1000}
        style={{ padding: "10px" }}
        arrowColor="transparent"
      >
        <div className="user_profile_tooltip">
          <div>
            <img
              src={imageUrl}
              className="user_profile_img"
              alt={`${name} ${lastName}`}
            />
            <span>{`${name} ${lastName}`}</span>
          </div>
          <span>77 Followers</span>
        </div>
      </Tooltip>
    </div>
  );
};

export default UserProfile;
