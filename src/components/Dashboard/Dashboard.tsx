import React from 'react'
import { DailySalesReport } from '../Reports/SalesReport/DailySalesReport/DailySalesReport'
import { useStateValue } from '../../context/StateProvider'
import { useNavigate } from 'react-router-dom';
import Roles from '../../constants/Roles';


const Dashboard: React.FC = () => {
    const [{ authentication },] = useStateValue();
    const nav = useNavigate();

    if (!authentication.roles.includes(Roles.ADMIN) || !authentication.roles.includes(Roles.SUPER_ADMIN)) {
        nav('/')
    }

    return (
        <div className='fade_in'>
            <DailySalesReport />

        </div>
    )
}

export default Dashboard