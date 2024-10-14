import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { actionTypes } from "../../context/reducer";
import { useStateValue } from "../../context/StateProvider";
import TabMenu from "../UI/TabMenu/TabMenu";
import AccountSettings from "./AccountSettings/AccountSettings";
import SystemSettings from "./SystemSettings/SystemSettings";
import usePersistentComponent from "../../Hooks/usePersistentComponent";
import FirestoreBackup from "../Backup/FirestoreBackup";

const components = {
  accountSettings: { componentName: "AccountSettings", component: AccountSettings },
  backup: { componentName: "backup", component: FirestoreBackup },
  systemSettings: { componentName: "SystemSettings", component: SystemSettings },
};

function Settings() {
  const [{ authentication }, dispatch] = useStateValue();
  const [displayComponent, setDisplayComponent] = usePersistentComponent(
    components,
    "accountSettings"
  );

  console.log(authentication)

  return (
    <div className="settings " id="settings">
      <TabMenu>
        <li
          className={
            displayComponent?.componentName == components?.accountSettings?.componentName
              ? "active"
              : ""
          }
          onClick={() => setDisplayComponent(components?.accountSettings)}
        >
          {t("accountSettings")}
        </li>
        <li
          className={
            displayComponent?.componentName == components?.backup?.componentName
              ? "active"
              : ""
          }
          onClick={() => setDisplayComponent(components?.backup)}
        >
          {t("backup")}
        </li>
        {/* <li
          className={
            displayComponent?.componentName == components?.sections?.componentName
              ? "active"
              : ""
          }
          onClick={() => setDisplayComponent(components?.sections)}
        >
          {t("sections")}
        </li> */}

        <li
          className={
            displayComponent?.componentName == components?.systemSettings?.componentName
              ? "active"
              : ""
          }
          onClick={() => setDisplayComponent(components?.systemSettings)}
        >
          {t("systemSettings")}
        </li>

      </TabMenu>

      {<displayComponent.component />}
    </div>
  );
}

export default Settings;
