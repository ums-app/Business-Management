
import React, { useState } from 'react'
import "./Customers"
import { t } from 'i18next'
import CustomersManagment from './CustomersManagement/CustomersManagment'
import ShortListedCustomers from './ShortListedCustomers/ShortListedCustomers'
import TabMenu from '../UI/TabMenu/TabMenu'
import usePersistentComponent from '../../Hooks/usePersistentComponent'
import { useStateValue } from '../../context/StateProvider'


// components for tabs
const components = {
    CustomersManagment: {
        componentName: "CustomersManagement",
        component: CustomersManagment,
    },
    ShortListedCustomers: { componentName: "ShortListedCustomers", component: ShortListedCustomers },
};

function Customers() {
    const [displayComponent, setDisplayComponent] = useState(
        { component: components.CustomersManagment.component, componentName: "CustomersManagement" }
    );

    const [{ authentication },] = useStateValue();






    return (
        <div className='employee'>

            {/* the navbar of the profile page */}

            <TabMenu>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.CustomersManagment?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent({ component: components?.CustomersManagment.component, componentName: components.CustomersManagment.componentName })}
                >
                    {t("customersManagement")}
                </li>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.ShortListedCustomers?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent({ component: components?.ShortListedCustomers.component, componentName: components.ShortListedCustomers.componentName })}
                >
                    {t('shortListedCustomers')}
                </li>
            </TabMenu>

            <div>
                {<displayComponent.component />}
            </div>

        </div >
    )
}





export default Customers