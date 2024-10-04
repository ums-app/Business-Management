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


function PurchaseProducts() {
    const nav = useNavigate();

    const [purchases, setPurchases] = useState();
    const purchasesCollectionRef = collection(db, Collections.Purchases);
    const [imageUrls, setImageUrls] = useState();


    useEffect(() => {

        const fetchData = async () => {
            const querySnapshot = await getDocs(purchasesCollectionRef);
            const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setPurchases(items);

            console.log(items);
        };

        fetchData();
    }, []);


    useEffect(() => {
        const fetchImages = async () => {
            const newImageUrls = {};
            await Promise.all(
                purchases.map(async (item) => {
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

        if (purchases) {
            fetchImages();
        }
    }, [purchases]);



    useEffect(() => {
        const fetchImages = async () => {
            const newImageUrls = {};
            await Promise.all(
                purchases.map(async (item) => {
                    const url = await getUserImage(item.email);
                    newImageUrls[item.email] = url; // Store image URL by product ID
                })
            );
            setImageUrls(newImageUrls); // Update state with all image URLs
        };

        if (purchases) {
            fetchImages();
        }
    }, [purchases]);


    if (!purchases || !imageUrls) {
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
                text={t('add') + " " + t('purchases')}
                onClick={() => nav("add")}
            />

            <h1 className='margin_10 title'>{t('purchases')}</h1>

            <div className='table_container '>
                <table className="full_width custom_table table_row_hover">
                    <thead >
                        <tr>
                            <th>{t('number')}</th>
                            <th>{t('createdDate')}</th>
                            <th>{t('total')}</th>
                            <th>{t('amount')}</th>
                            <th>{t('totalElement')}</th>
                            <th>{t('costs')}</th>
                            <th>{t('transfer costs')}</th>
                            <th>{t('tax costs')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases?.map((emp, index) => {
                            return <tr
                                className=" cursor_pointer hover"
                                onClick={() => nav('/purchase-products/' + emp.id)}
                                key={emp.id}
                            >
                                <td>{index + 1}</td>
                                <td><img src={imageUrls[emp.email]} alt={t('user') + " " + t('image')} className='user_profile_img' /></td>
                                <td>{emp.name}</td>
                                <td>{emp.lastName}</td>
                                <td>{emp.jobTitle} </td>
                                <td>{emp.phoneNumber}</td>
                                <td>{emp.salary}</td>
                                <td>{emp.salesPercent}%</td>
                            </tr>
                        })
                        }
                    </tbody>
                </table>
            </div>



        </div>
    )
}



export default PurchaseProducts

