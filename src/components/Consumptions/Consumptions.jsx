import React, { useEffect, useState } from 'react'
import RetailConsumptions from './RetailConsumptions/RetailConsumptions';
import MajorConsumptions from './MajorConsumptions/MajorConsumptions';
import Withdrawals from './Withdrawals/Withdrawals';
import ConstantConsumptions from './ConstantConsumptions/ConstantConsumptions';
import { t } from 'i18next';
import TabMenu from '../UI/TabMenu/TabMenu';
import NotFound from '../../pages/NotFound/NotFound';
import { useStateValue } from '../../context/StateProvider';
import Roles from '../../constants/Roles';
import DailyConsumptions from './DailyConsumptions/DailyConsumptions';
import Circle from '../UI/Loading/Circle';

// components for tabs
const components = {
    DailyConsumptions: { componentName: 'DailyConsumptions', component: DailyConsumptions },
    RetailConsumptions: { componentName: "RetailConsumptions", component: RetailConsumptions, },
    MajorConsumptions: { componentName: "MajorConsumptions", component: MajorConsumptions },
    Withdrawals: { componentName: "Withdrawals", component: Withdrawals },
    ConstantConsumptions: { componentName: "ConstantConsumptions", component: ConstantConsumptions },
};
function Consumptions() {
    const [displayComponent, setDisplayComponent] = useState(
        { component: components.DailyConsumptions.component, componentName: components.DailyConsumptions.componentName }
    );
    const [{ authentication },] = useStateValue()

    if (!authentication.isAuthenticated) {
        return <Circle />; // or return null; for no UI during loading
    }


    if (!authentication.roles.includes(Roles.ADMIN) && !authentication.roles.includes(Roles.SUPER_ADMIN)) {
        return <NotFound />
    }

    return (
        <div>

            {/* the navbar of the profile page */}

            <TabMenu>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.DailyConsumptions?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent({ component: components?.DailyConsumptions.component, componentName: components.DailyConsumptions.componentName })}
                >
                    {t("dailyConsumptions")}
                </li>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.RetailConsumptions?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent({ component: components?.RetailConsumptions.component, componentName: components.RetailConsumptions.componentName })}
                >
                    {t("retailConsumptions")}
                </li>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.Withdrawals?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent({ component: components?.Withdrawals.component, componentName: components.Withdrawals.componentName })}
                >
                    {t('withdrawals')}
                </li>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.MajorConsumptions?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent({ component: components?.MajorConsumptions.component, componentName: components.MajorConsumptions.componentName })}
                >
                    {t('majorConsumptions')}
                </li>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.ConstantConsumptions?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent({ component: components?.ConstantConsumptions.component, componentName: components.ConstantConsumptions.componentName })}
                >
                    {t('constantConsumptions')}
                </li>
            </TabMenu>

            <div>
                {<displayComponent.component />}
            </div>
        </div>
    )
}

export default Consumptions