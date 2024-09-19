import { t } from 'i18next'
import React, { useEffect, useState } from 'react'
// import "../Employee.css"
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../constants/FirebaseConfig';
import Collections from '../../../../constants/Collections';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate';

function PersonalInformation() {
    const { customerId } = useParams();

    const [customer, setCustomer] = useState();
    const [visitor, setVisitor] = useState()
    useEffect(() => {
        const getData = async () => {
            try {
                const data = await getDoc(doc(db, Collections.Customers, customerId));
                if (data.exists()) {
                    setCustomer(data.data())
                    getVisitor(data.data().visitor)
                }

            } catch (err) {
                console.log(err);
            }
        }

        getData();

    }, [customerId])

    const getVisitor = async (visitorId) => {
        try {
            const data = await getDoc(doc(db, Collections.Employees, visitorId));
            if (data.exists()) {
                setVisitor(data.data())
            }
        } catch (err) {
            console.log(err);
        }
    }



    if (!customer) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }


    return (
        <div className='personal_info display_flex flex_flow_wrap justify_content_center '>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span >{t('name')} </span>
                <span>{customer.name}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('lastName')} </span>
                <span>{customer.lastName}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('organization')} </span>
                <span>{customer.organizationName}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('phoneNumber')} </span>
                <span>{customer.phoneNumber}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('email')} </span>
                <span>{customer.email}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('visitor')}</span>
                <span>{visitor?.name} {visitor?.lastName}</span>
            </div>
        </div>
    )
}

export default PersonalInformation