import React, { useEffect, useState } from 'react'
import { Log } from '../../Types/Types'
import DailyLogs from './DailyLogs/DailyLogs';
import AllLogs from './AllLogs/AllLogs';
import { useStateValue } from '../../context/StateProvider';
import Circle from '../UI/Loading/Circle';
import Roles from '../../constants/Roles';
import NotFound from '../../pages/NotFound/NotFound';
import TabMenu from '../UI/TabMenu/TabMenu';
import { t } from 'i18next';



// components for tabs
const components = {
    DailyLogs: {
        componentName: "DailyLogs",
        component: DailyLogs,
    },
    AllLogs: { componentName: "AllLogs", component: AllLogs },
};
const Logs: React.FC = () => {

    const [displayComponent, setDisplayComponent] = useState(
        { component: components.DailyLogs.component, componentName: components.DailyLogs.componentName }
    );

    const [{ authentication },] = useStateValue();



    if (!authentication.isAuthenticated) {
        return <Circle />; // or return null; for no UI during loading
    }


    if (!authentication.roles.includes(Roles.SUPER_ADMIN)) {
        return <NotFound />
    }


    return (
        <div>
            <TabMenu>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.DailyLogs?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent({ component: components?.DailyLogs.component, componentName: components.DailyLogs.componentName })}
                >
                    {t("dailyEvents")}
                </li>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.AllLogs?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent({ component: components?.AllLogs.component, componentName: components.AllLogs.componentName })}
                >
                    {t('events')}
                </li>
            </TabMenu>

            <div>
                {<displayComponent.component />}
            </div>
        </div>
    )
}

export default Logs