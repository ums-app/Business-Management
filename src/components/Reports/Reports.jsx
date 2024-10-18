import React, { useState } from 'react'
import TabMenu from '../UI/TabMenu/TabMenu';
import SalesReport from './SalesReport/SalesReport';
import ConsumptionsReport from './ConsumptionsReport/ConsumptionsReport';
import { t } from 'i18next';
import { useStateValue } from '../../context/StateProvider';
import { useNavigate } from 'react-router-dom';
import Roles from '../../constants/Roles';
import NotFound from '../../pages/NotFound/NotFound';
import Circle from '../UI/Loading/Circle';



const components = {
    SalesReport: {
        componentName: "SalesReport",
        component: SalesReport,
    },
    ConsumptionsReport: { componentName: "ConsumptionsReport", component: ConsumptionsReport },
};

function Reports() {
    const [displayComponent, setDisplayComponent] = useState(
        { component: components.SalesReport.component, componentName: components.SalesReport.componentName }
    );
    const [{ authentication }, dispatch] = useStateValue();



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
                            components?.SalesReport?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent({ component: components?.SalesReport.component, componentName: components.SalesReport.componentName })}
                >
                    {t("sales")}
                </li>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.ConsumptionsReport?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent({ component: components?.ConsumptionsReport.component, componentName: components.ConsumptionsReport.componentName })}
                >
                    {t('consumptions')}
                </li>
            </TabMenu>

            <div>
                {<displayComponent.component />}
            </div>
        </div>
    )
}

export default Reports