
import React, { useState } from 'react'
import "./Customers"
import { t } from 'i18next'
import CustomersManagment from './CustomersManagement/CustomersManagment'
import ShortListedCustomers from './ShortListedCustomers/ShortListedCustomers'
import TabMenu from '../UI/TabMenu/TabMenu'
import { useStateValue } from '../../context/StateProvider'
import Roles from '../../constants/Roles'
import { useNavigate } from 'react-router-dom'
import NotFound from '../../pages/NotFound/NotFound'
import Circle from '../UI/Loading/Circle'
import CustomerListOnCustomerType from './CustomerListOnCustomerType/CustomerListOnCustomerType'


// components for tabs
const components = {
    CustomersManagment: {
        componentName: "CustomersManagement",
        component: CustomersManagment,
    },
    ShortListedCustomers: { componentName: "ShortListedCustomers", component: ShortListedCustomers },
    CustomerListOnCustomerType: { componentName: "CustomerListOnCustomerType", component: CustomerListOnCustomerType },
};

function Customers() {
    const [displayComponent, setDisplayComponent] = useState(
        { component: components.CustomersManagment.component, componentName: "CustomersManagement" }
    );

    const [{ authentication },] = useStateValue();



    if (!authentication.isAuthenticated) {
        return <Circle />; // or return null; for no UI during loading
    }


    if (!authentication.roles.includes(Roles.ADMIN) && !authentication.roles.includes(Roles.SUPER_ADMIN)) {
        return <NotFound />
    }


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
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.CustomerListOnCustomerType?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent({ component: components?.CustomerListOnCustomerType.component, componentName: components.CustomerListOnCustomerType.componentName })}
                >
                    {t('customerOfOtherCities')}
                </li>
            </TabMenu>

            <div>
                {<displayComponent.component />}
            </div>

        </div >
    )
}





export default Customers