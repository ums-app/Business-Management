import { ErrorMessage, Field, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Form, useNavigate } from 'react-router-dom'
import Button from '../UI/Button/Button'
import Modal from '../UI/modal/Modal'
import { t } from 'i18next'
import * as yup from "yup";
import { toast } from 'react-toastify'
import AddCustomer from './AddCustomer'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../constants/FirebaseConfig'
import LoadingTemplateContainer from '../UI/LoadingTemplate/LoadingTemplateContainer'
import ButtonLoadingTemplate from '../UI/LoadingTemplate/ButtonLoadingTemplate'
import HeadingMenuTemplate from '../UI/LoadingTemplate/HeadingMenuTemplate'
import ShotLoadingTemplate from '../UI/LoadingTemplate/ShotLoadingTemplate'


function Customers() {
    const [addFormModal, setaddFormModal] = useState(false)
    const nav = useNavigate();
    const customersCollectionRef = collection(db, 'Customers');
    const [customers, setCustomers] = useState();



    useEffect(() => {
        getCustomers();

    }, []);




    const getCustomers = async () => {
        const querySnapshot = await getDocs(customersCollectionRef);
        const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setCustomers(items);

        console.log(items);
    };


    if (!customers) {
        return (
            <LoadingTemplateContainer>
                <ButtonLoadingTemplate />
                <HeadingMenuTemplate />
                <ShotLoadingTemplate />
            </LoadingTemplateContainer>
        );
    }



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
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers?.map((emp, index) => {
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
                                <td></td>
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