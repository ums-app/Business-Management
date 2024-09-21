import React, { useEffect, useState } from 'react'
import { t } from 'i18next'
import Button from '../UI/Button/Button'
import { toast } from 'react-toastify'
import { db } from '../../constants/FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'
import LoadingTemplateContainer from "../UI/LoadingTemplate/LoadingTemplateContainer"
import HeadingMenuTemplate from "../UI/LoadingTemplate/HeadingMenuTemplate"
import ShotLoadingTemplate from "../UI/LoadingTemplate/ShotLoadingTemplate"
import ButtonLoadingTemplate from "../UI/LoadingTemplate/ButtonLoadingTemplate"
import { getProductImage, getUserImage } from '../../Utils/FirebaseTools'
import Collections from '../../constants/Collections';
import Modal from '../UI/modal/Modal';
import SelectCustomer from './AddSaleFactor/SelectCustomer/SelectCustomer';
import { gregorianToJalali } from 'shamsi-date-converter';
import ICONS from '../../constants/Icons';
import { actionTypes } from '../../context/reducer';
import { useStateValue } from '../../context/StateProvider';




function Sales() {
    const nav = useNavigate();
    const [, dispatch] = useStateValue()
    const [sales, setSales] = useState();
    const salesCollectionRef = collection(db, Collections.Sales);
    const [imageUrls, setImageUrls] = useState();
    const [showSelectCustomerModal, setShowSelectCustomerModal] = useState(false)


    useEffect(() => {

        const fetchData = async () => {
            const querySnapshot = await getDocs(salesCollectionRef);
            const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setSales(items);

            console.log(items);
        };

        fetchData();
    }, []);


    useEffect(() => {
        const fetchImages = async () => {
            const newImageUrls = {};
            await Promise.all(
                sales.map(async (item) => {
                    try {
                        const url = await getProductImage(item?.productId);
                        console.log(url);
                        newImageUrls[item.email] = url; // Store image URL by email
                    } catch (err) {
                        newImageUrls[item.email] = 'default';
                        console.log(`Error fetching image for ${item.productId}:`, err);
                    }
                })
            );
            setImageUrls(newImageUrls); // Update state with all image URLs
            console.log(newImageUrls);
        };

        if (sales) {
            fetchImages();
        }
    }, [sales]);



    useEffect(() => {
        const fetchImages = async () => {
            const newImageUrls = {};
            await Promise.all(
                sales.map(async (item) => {
                    const url = await getUserImage(item.email);
                    newImageUrls[item.email] = url; // Store image URL by product ID
                })
            );
            setImageUrls(newImageUrls); // Update state with all image URLs
        };

        if (sales) {
            fetchImages();
        }
    }, [sales]);


    if (!sales || !imageUrls) {
        return (
            <LoadingTemplateContainer>
                <ButtonLoadingTemplate />
                <HeadingMenuTemplate />
                <ShotLoadingTemplate />
            </LoadingTemplateContainer>
        );
    }

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



    return (
        <div>
            <Button
                text={t('add') + " " + t('factor') + " " + t('sale')}
                // onClick={() => nav("/customers")}
                onClick={() => setShowSelectCustomerModal(true)}
            />

            <Modal show={showSelectCustomerModal} modalClose={() => setShowSelectCustomerModal(false)}>
                <SelectCustomer />
            </Modal>

            <h1 className='margin_10 title'>{t('sales')}</h1>

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
                            <th>{t('remainedAmount')}</th>
                            <th>{t('status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales?.map((factor, index) => {
                            console.log(factor.createdDate.date);
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
                                <td>{getTotalPriceOfProdcuts(factor?.productsInFactor) - getTotalPaidAmount(factor?.payments)}</td>
                                <td>{getStatus(getTotalPriceOfProdcuts(factor?.productsInFactor), getTotalPaidAmount(factor?.payments))}</td>
                            </tr>
                        })
                        }
                    </tbody>
                </table>
            </div>



        </div>
    )
}

export default Sales
