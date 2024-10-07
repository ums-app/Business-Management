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
import { VisitorContractType } from '../../../../constants/Others';
import { formatDate, formatFirebaseDates } from '../../../../Utils/DateTimeUtils';
import { Employee } from '../../../../Types/Types';
import { mapDocToEmployee } from '../../../../Utils/Mapper';
import { getEmployeeById } from '../../../../Utils/FirebaseTools';

const PersonalInformation: React.FC = () => {
    const [{ authentication }, dispatch] = useStateValue()
    const { employeeId } = useParams();
    const [notFound, setnotFound] = useState<string>()

    const [showPassword, setshowPassword] = useState(false)
    const [employee, setemployee] = useState<Employee>();
    useEffect(() => {

        if (employeeId)
            getEmployeeById(employeeId).then(res => {
                if (res)
                    setemployee(res)
                else
                    setnotFound(t("notFound"))

            }).catch(err => {
                setnotFound(err)
            })


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
                <div className='info_card position_relative display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                    <span
                        className='position_absolute show_pass'
                        onClick={() => setshowPassword(!showPassword)}>
                        <i className={showPassword ? ICONS.eyeSlashFill : ICONS.eyeFill}></i>
                    </span>
                    <span>{t('password')} </span>
                    {showPassword && <span>{employee.password}</span>}
                    {!showPassword && <span>******</span>}

                </div>
            }
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('createdDate')} </span>
                <span>{employee?.createdDate && formatFirebaseDates(employee?.createdDate)}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('joinedDate')} </span>
                <span>{employee?.joinedDate && formatFirebaseDates(employee?.joinedDate)}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('salary')} </span>
                <span>
                    {employee.salaryHistory.length > 0 ? employee.salaryHistory[employee.salaryHistory.length - 1].amount : employee.salary}
                </span>
            </div>
            {employee?.visitorContractType &&
                <>
                    <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                        <span>{t('visitorContractType')}</span>
                        <span>{employee.visitorContractType == VisitorContractType.PERCENT ? t('percent') : t('BasedOnProductNumber')}</span>
                    </div>
                    <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                        <span>{employee.visitorContractType == VisitorContractType.PERCENT ? t('percent') : t('amountBasedOnEachProduct')}</span>
                        <span>{employee.visitorAmount} {employee.visitorContractType == VisitorContractType.PERCENT && '%'}</span>
                    </div>
                </>
            }
        </div >
    )
}

export default PersonalInformation