
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../UI/Button/Button'
import { t } from 'i18next'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../constants/FirebaseConfig'
import LoadingTemplateContainer from '../UI/LoadingTemplate/LoadingTemplateContainer'
import ButtonLoadingTemplate from '../UI/LoadingTemplate/ButtonLoadingTemplate'
import HeadingMenuTemplate from '../UI/LoadingTemplate/HeadingMenuTemplate'
import ShotLoadingTemplate from '../UI/LoadingTemplate/ShotLoadingTemplate'
import Collections from '../../constants/Collections'


function Customers() {
    const nav = useNavigate();
    const customersCollectionRef = collection(db, Collections.Customers);
    const employeesCollectionRef = collection(db, Collections.Employees);

    const [customers, setCustomers] = useState();
    const [employees, setEmployees] = useState()

    useEffect(() => {
        getCustomers();
        getEmployees();

    }, []);




    const getCustomers = async () => {
        const querySnapshot = await getDocs(customersCollectionRef);
        const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setCustomers(items);

        console.log(items);
    };


    const getEmployees = async () => {
        const querySnapshot = await getDocs(employeesCollectionRef);
        const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setEmployees(items);

        console.log(items);
    };


    if (!customers || !employees) {
        return (
            <LoadingTemplateContainer>
                <ButtonLoadingTemplate />
                <HeadingMenuTemplate />
                <ShotLoadingTemplate />
            </LoadingTemplateContainer>
        );
    }


    console.log(customers);
    console.log(employees);


    return (
        <div>
            <Button
                text={t('add') + " " + t('customer')}
                onClick={() => nav('add')}
            />


            <h1 className='margin_10 title'>{t('customers')}</h1>

            <div className='table_container '>
                <table className="full_width custom_table table_row_hover">
                    <thead >
                        <tr>
                            <th>{t('number')}</th>
                            <th>{t('name')}</th>
                            <th>{t('lastName')}</th>
                            <th>{t('name')} {t('organization')}</th>
                            <th>{t('phoneNumber')}</th>
                            <th>{t('location')}</th>
                            <th>{t('visitor')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers?.map((emp, index) => {

                            const visitor = employees.find(item => item.id == emp.visitor)

                            return <tr
                                className=" cursor_pointer hover"
                                onClick={() => nav('/customers/' + emp.id)}
                                key={emp.id}
                            >
                                <td>{index + 1}</td>
                                <td>{emp.name}</td>
                                <td>{emp.lastName}</td>
                                <td>{emp.organizationName} </td>
                                <td>{emp.phoneNumber}</td>
                                <td>{emp.location}</td>
                                <td>{visitor?.name} {visitor?.lastName}</td>
                            </tr>
                        })
                        }


                    </tbody>
                </table>
            </div>




        </div>
    )
}





export default Customers