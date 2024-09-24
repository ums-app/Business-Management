import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useStateValue } from '../../../../context/StateProvider';
import { t } from 'i18next';
import { db } from '../../../../constants/FirebaseConfig';
import Collections from '../../../../constants/Collections';
import { useNavigate, useParams } from 'react-router-dom';
import ICONS from '../../../../constants/Icons';
import { actionTypes } from '../../../../context/reducer';
import { formatFirebaseDates } from '../../../../Utils/DateTimeUtils';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate';

function CustomerPayments() {
    const { customerId } = useParams();
    const nav = useNavigate();
    const [, dispatch] = useStateValue()
    const [payments, setPayments] = useState();
    const paymentsCollectionRef = collection(db, Collections.Payments);

    const [imageUrls, setImageUrls] = useState();
    const [showSelectCustomerModal, setShowSelectCustomerModal] = useState(false);


    useEffect(() => {

        const fetchData = async () => {
            const q = query(paymentsCollectionRef, where("customerId", "==", customerId));
            try {
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                setPayments(items);
            } catch (error) {
                console.error("Error getting documents: ", error);
            }

        };
        fetchData();
    }, []);


    console.log(payments);

    if (!payments) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }



    return (
        <div>
            <div className='full_width input'></div>
            <div className='table_container '>
                <table className="full_width custom_table table_row_hover">
                    <thead >
                        <tr>
                            <th>{t('number')}</th>
                            <th>{t('createdDate')}</th>
                            <th>{t('employee')}</th>
                            <th>{t('paidAmount')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments?.map((pay, index) => {
                            console.log(pay.createdDate);
                            return <tr
                                className=" cursor_pointer hover"
                                onClick={() => {
                                    // dispatch({
                                    //     type: actionTypes.SET_FACTOR,
                                    //     payload: pay.saleId
                                    // })
                                    // dispatch({
                                    //     type: actionTypes.ADD_CUSTOMER_TO_SALE_FACTOR,
                                    //     payload: factor.customer
                                    // })
                                    // nav('/sales/' + factor.id)
                                }}
                                key={pay.id}
                            >
                                <td>{index + 1}</td>
                                <td>{formatFirebaseDates(pay.createdDate)}</td>
                                <td>{pay.by}</td>
                                <td>{pay.amount}</td>
                            </tr>
                        })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CustomerPayments