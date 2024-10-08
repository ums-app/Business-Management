import { collection, getDocs, query, where } from 'firebase/firestore';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { db } from '../../../constants/FirebaseConfig';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ButtonLoadingTemplate from '../../UI/LoadingTemplate/ButtonLoadingTemplate';
import HeadingMenuTemplate from '../../UI/LoadingTemplate/HeadingMenuTemplate';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import Collections from '../../../constants/Collections';
import { useStateValue } from '../../../context/StateProvider';
import { mapDocToCustomer } from '../../../Utils/Mapper';

function EmployeeCustomersForEmployee() {
    const nav = useNavigate()
    const [{ authentication },] = useStateValue()
    const [customers, setCustomers] = useState();
    const customersCollectionRef = collection(db, Collections.Customers);



    useEffect(() => {
        getAllEmployeeCustomers();
    }, [])

    const getAllEmployeeCustomers = async () => {
        try {

            const q = query(customersCollectionRef, where("visitor", "==", authentication.originalEntityId))
            const data = await getDocs(q);
            const items = data.docs.map((doc) => mapDocToCustomer(doc));
            setCustomers(items);
        } catch (err) {
            // toast.error(err.message)
            console.log(err);
            setCustomers([])
        }
    }

    console.log(customers);

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
        <div className='customers'>

            <h1 className='text_align_center margin_top_20'>{t('customers')}</h1>
            <table className="full_width custom_table table_row_hover">
                <thead >
                    <tr>
                        <th>{t('number')}</th>
                        <th>{t('name')}</th>
                        <th>{t('lastName')}</th>
                        <th>{t('location')}</th>
                        <th>{t('phoneNumber')}</th>
                    </tr>
                </thead>
                <tbody>
                    {customers?.map((cus, index) => {
                        return <tr
                            className=" cursor_pointer hover"
                            onClick={() =>
                                nav('/customers/' + cus.id)
                            }
                            key={cus.id}
                        >
                            <td>{index + 1}</td>
                            <td>{cus.name}</td>
                            <td>{cus.lastName}</td>
                            <td>{cus.location} </td>
                            <td>{cus.phoneNumber}</td>

                        </tr>
                    })
                    }

                    {customers?.length == 0 && <tr>
                        <td colSpan={6}>{t('notExist')}</td>
                    </tr>}
                </tbody>
            </table>
        </div>
    )
}

export default EmployeeCustomersForEmployee