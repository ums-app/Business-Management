import React, { useState } from "react";
import Button from "../../UI/Button/Button";
import { t } from "i18next";

function AccountSettings() {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  return (
    <div>
      <section>
        {!showPasswordChange ? (
          <Button
            text={t("change") + " " + t("password")}
            onClick={() => setShowPasswordChange(true)}
          />
        ) : (
          <Button
            text={t("cancel")}
            onClick={() => setShowPasswordChange(false)}
          />
        )}
        {/* {showPasswordChange && <ResetPassword />} */}
      </section>
    </div>
  );
}

export default AccountSettings;
