import React, { useEffect, useState } from "react";
import { useStateValue } from "../../../context/StateProvider";
import { actionTypes } from "../../../context/reducer";
import { t } from "i18next";
function SystemSettings() {
  const [{ locale }, dispatch] = useStateValue();
  useEffect(() => {
    document.documentElement.dir = locale === "en" ? "ltr" : "rtl";
    document.documentElement.lang = locale === "en" ? "en" : "fa";
  }, [locale]);


  const handleChangeLanguage = (e) => {
    const language = e.target.value;
    console.log(language);
    dispatch({
      type: actionTypes.CHANGE_LOCALE,
      payload: {
        lang: language,
      },
    });
  };

  return (
    <div>
      <section className="">
        <p className="title">{t("change") + " " + t("language")}</p>
        <select
          className=" "
          name="languages"
          id=""
          defaultValue={locale}
          onChange={handleChangeLanguage}
        >
          <option value="fa">Farsi</option>
          <option value="en">English</option>
        </select>
      </section>
    </div>
  );
}

export default SystemSettings;
