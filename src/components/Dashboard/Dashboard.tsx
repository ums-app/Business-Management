import React from 'react'
import { DailySalesReport } from '../Reports/SalesReport/DailySalesReport/DailySalesReport'
import { useStateValue } from '../../context/StateProvider'
import Roles from '../../constants/Roles';
import NotFound from '../../pages/NotFound/NotFound';


const Dashboard: React.FC = () => {
    const [{ authentication },] = useStateValue();

    if (!authentication.roles.includes(Roles.ADMIN) && !authentication.roles.includes(Roles.SUPER_ADMIN)) {
        return <NotFound />
    }


    return (
        <div className='fade_in'>
            <DailySalesReport />

        </div>
    )
}

export default Dashboard