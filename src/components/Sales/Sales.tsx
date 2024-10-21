import React, { useEffect, useState } from 'react'
import { t } from 'i18next'
import { useNavigate } from 'react-router-dom'
import { useStateValue } from '../../context/StateProvider';
import NotFound from '../../pages/NotFound/NotFound';
import Roles from '../../constants/Roles';
import Circle from '../UI/Loading/Circle';
import TabMenu from '../UI/TabMenu/TabMenu';
import DailySales from './DailySales/DailySales';
import AllSales from './AllSales/AllSales';


// components for tabs
const components = {
    DailySales: {
        componentName: "DailySales",
        component: DailySales,
    },
    AllSales: { componentName: "AllSales", component: AllSales },
};
const Sales: React.FC = () => {
    const [{ authentication }, dispatch] = useStateValue()
    const [displayComponent, setDisplayComponent] = useState(
        { component: components.DailySales.component, componentName: components.DailySales.componentName }
    );

    if (!authentication.isAuthenticated) {
        return <Circle />; // or return null; for no UI during loading
    }


    if (!authentication.roles.includes(Roles.SUPER_ADMIN)) {
        return <NotFound />
    }

    if (!authentication.isAuthenticated) {
        return <Circle />; // or return null; for no UI during loading
    }


    if (!authentication.roles.includes(Roles.ADMIN) && !authentication.roles.includes(Roles.SUPER_ADMIN)) {
        return <NotFound />
    }

    return (
        <div className='fade_in'>
            <div>
                <TabMenu>
                    <li
                        className={
                            displayComponent?.componentName ==
                                components?.DailySales?.componentName
                                ? "active"
                                : ""
                        }
                        onClick={() => setDisplayComponent({ component: components?.DailySales.component, componentName: components.DailySales.componentName })}
                    >
                        {t("dailySales")}
                    </li>
                    <li
                        className={
                            displayComponent?.componentName ==
                                components?.AllSales?.componentName
                                ? "active"
                                : ""
                        }
                        onClick={() => setDisplayComponent({ component: components?.AllSales.component, componentName: components.AllSales.componentName })}
                    >
                        {t('sales')}
                    </li>
                </TabMenu>

                <div>
                    {<displayComponent.component />}
                </div>
            </div>


        </div >
    )
}

export default Sales
