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

import Collections from '../../constants/Collections';


function PurchaseProducts() {
    const nav = useNavigate();

    const [purchases, setPurchases] = useState();
    const purchasesCollectionRef = collection(db, Collections.Purchases);


    useEffect(() => {

        const fetchData = async () => {
            const querySnapshot = await getDocs(purchasesCollectionRef);
            const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setPurchases(items);
            console.log(items);
        };

        fetchData();
    }, []);




    if (!purchases) {
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
                text={t('add') + " " + t('purchases')}
                onClick={() => nav("add")}
            />

            <h1 className='margin_10 title'>{t('purchases')}</h1>

            <div className='table_container '>
                <table className="full_width custom_table table_row_hover">
                    <thead >
                        <tr>
                            <th>{t('number')}</th>
                            <th>{t('indexNumber')}</th>
                            <th>{t('createdDate')}</th>
                            <th>{t("total")} {t('package')}</th>
                            <th>{t('total')} {t('products')}</th>
                            <th>{t('amount')}</th>
                            <th>{t('totalAll')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases?.map((purchase, index) => {
                            return <tr
                                className=" cursor_pointer hover"
                                onClick={() => nav('/purchase-products/' + purchase.id)}
                                key={purchase.id}
                            >
                                {/* <td>{index + 1}</td>
                                <td>{emp.name}</td>
                                <td>{emp.lastName}</td>
                                <td>{emp.jobTitle} </td>
                                <td>{emp.phoneNumber}</td>
                                <td>{emp.salary}</td>
                                <td>{emp.salesPercent}%</td> */}
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

