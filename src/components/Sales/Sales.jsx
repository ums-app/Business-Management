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




function Sales() {
    const nav = useNavigate();

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



    const sendDataToAPI = () => {
        toast.success("data added")
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
                            <th>{t('totalAll')}</th>
                            <th>{t('paidAmount')}</th>
                            <th>{t('remainedAmount')}</th>
                            <th>{t('status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales?.map((factor, index) => {
                            return <tr
                                className=" cursor_pointer hover"
                                onClick={() => nav('/sales/' + factor.id)}
                                key={factor.id}
                            >
                                <td>{index + 1}</td>
                                <td>{factor?.customer?.name}</td>
                                <td>{factor?.customer?.lastName}</td>
                                <td>{gregorianToJalali(factor?.createdDate).join('/')} </td>
                                <td>{factor?.products?.length}</td>
                                <td>{factor?.paidAmount}</td>
                                <td>{factor?.remainedAmount}</td>
                                <td>{t('status')}</td>

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
