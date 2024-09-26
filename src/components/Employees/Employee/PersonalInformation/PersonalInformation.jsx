import { t } from 'i18next'
import React, { useEffect, useState } from 'react'
import "../Employee.css"
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../constants/FirebaseConfig';
import Collections from '../../../../constants/Collections';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate';
import { gregorianToJalali } from 'shamsi-date-converter';
import { useStateValue } from '../../../../context/StateProvider';
import ICONS from '../../../../constants/Icons';

function PersonalInformation() {
    const [{ authentication }, dispatch] = useStateValue()
    const { employeeId } = useParams();

    const [showPassword, setshowPassword] = useState(false)
    const [employee, setemployee] = useState();
    useEffect(() => {
        const getData = async () => {
            try {
                const data = await getDoc(doc(db, Collections.Employees, employeeId));
                if (data.exists()) {
                    setemployee(data.data())
                }

            } catch (err) {
                console.log(err);
            }
        }

        getData();

    }, [employeeId])



    if (!employee) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }


    return (
        <div className='personal_info display_flex flex_flow_wrap justify_content_center '>
            <div className='info_card  display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('name')} </span>
                <span>{employee.name}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('lastName')} </span>
                <span>{employee.lastName}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('jobTitle')} </span>
                <span>{employee.jobTitle}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('phoneNumber')} </span>
                <span>{employee.phoneNumber}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('email')} </span>
                <span>{employee.email}</span>
            </div>
            {authentication?.roles?.includes('SUPER_ADMIN') &&
                <div div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                    <span onClick={() => setshowPassword(!showPassword)}>
                        <i className={showPassword ? ICONS.eyeSlashFill : ICONS.eyeFill}></i>
                    </span>
                    <span>{t('password')} </span>
                    {showPassword && <span>{employee.password}</span>}
                    {!showPassword && <span>******</span>}

                </div>
            }
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('createdDate')} </span>
                <span>{employee?.createdDate && gregorianToJalali(employee?.createdDate?.toDate()).join('/')}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('joinedDate')} </span>
                <span>{employee?.joinedDate && gregorianToJalali(employee?.joinedDate?.toDate()).join('/')}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('salary')} </span>
                <span>{employee.salary}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('percent')} {t('sales')}</span>
                <span>{employee.salesPercent}%</span>
            </div>
        </div >
    )
}

export default PersonalInformation