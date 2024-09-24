import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import Collections from '../../../../constants/Collections';
import { db } from '../../../../constants/FirebaseConfig';
import { useNavigate, useParams } from 'react-router-dom';
import { t } from 'i18next';
import { actionTypes } from '../../../../context/reducer';
import ICONS from '../../../../constants/Icons';
import { gregorianToJalali } from 'shamsi-date-converter';
import { useStateValue } from '../../../../context/StateProvider';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate';

function CustomerProductPurchases() {
    const { customerId } = useParams();
    const nav = useNavigate();
    const [, dispatch] = useStateValue()
    const [sales, setSales] = useState();
    const salesCollectionRef = collection(db, Collections.Sales);
    const [imageUrls, setImageUrls] = useState();
    const [showSelectCustomerModal, setShowSelectCustomerModal] = useState(false);


    useEffect(() => {

        const fetchData = async () => {
            const q = query(salesCollectionRef, where("customer.id", "==", customerId));
            try {
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                setSales(items);
            } catch (error) {
                console.error("Error getting documents: ", error);
            }

        };
        fetchData();
    }, []);


    console.log(sales);


    const getTotalProdcuts = (products) => {
        let total = 0;
        products.forEach(item => {
            total += Number(item.total);
        })
        return total;
    }

    const getTotalPriceOfProdcuts = (products) => {
        let total = 0;
        products.forEach(item => {
            total += Number(item.totalPrice);
        })
        return total;
    }

    const getTotalPaidAmount = (payments) => {
        let total = 0;
        payments.forEach(item => {
            total += Number(item.amount);
        })
        return total;
    }

    const getStatus = (total, paid) => {
        if (total - paid > 0) {
            return <span className='status_r'><i className={ICONS.cross}></i> {t('UNCOMPLETED')}</span >
        }
        return <span className='status_g'><i className={ICONS.thick}></i>{t('COMPLETED')}</span>
    }


    if (!sales) {
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
                            <th>{t('name')}</th>
                            <th>{t('lastName')}</th>
                            <th>{t('createdDate')}</th>
                            <th>{t('totalElements')}</th>
                            <th>{t('totalPrice')}</th>
                            <th>{t('paidAmount')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales?.map((factor, index) => {
                            console.log(factor.createdDate);
                            return <tr
                                className=" cursor_pointer hover"
                                onClick={() => {
                                    dispatch({
                                        type: actionTypes.SET_FACTOR,
                                        payload: factor
                                    })
                                    dispatch({
                                        type: actionTypes.ADD_CUSTOMER_TO_SALE_FACTOR,
                                        payload: factor.customer
                                    })
                                    nav('/sales/' + factor.id)
                                }}
                                key={factor.id}
                            >
                                <td>{index + 1}</td>
                                <td>{factor?.customer?.name}</td>
                                <td>{factor?.customer?.lastName}</td>
                                <td>{factor.createdDate && gregorianToJalali(new Date(factor?.createdDate.toDate())).join('/')} </td>
                                <td>{getTotalProdcuts(factor?.productsInFactor)}</td>
                                <td>{getTotalPriceOfProdcuts(factor?.productsInFactor)}</td>
                                <td>{getTotalPaidAmount(factor?.payments)}</td>

                            </tr>
                        })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CustomerProductPurchases