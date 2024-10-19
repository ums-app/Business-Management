import { t } from 'i18next'
import React, { useEffect, useState } from 'react'
// import "../Employee.css"
import { useParams } from 'react-router-dom';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate';
import { useStateValue } from '../../../../context/StateProvider';
import ICONS from '../../../../constants/Icons';
import { VisitorContractType } from '../../../../constants/Others';
import { formatFirebaseDates } from '../../../../Utils/DateTimeUtils';
import { Employee, Partner } from '../../../../Types/Types';
import { getEmployeeById, getPartnerById } from '../../../../Utils/FirebaseTools';
import NotFound from '../../../../pages/NotFound/NotFound';

const PartnerPersonalInformation: React.FC = () => {
    const [{ authentication }, dispatch] = useStateValue()
    const { partnerId } = useParams();
    const [notFound, setnotFound] = useState<boolean>()

    const [showPassword, setshowPassword] = useState(false)
    const [partner, setPartner] = useState<Partner>();
    useEffect(() => {

        if (partnerId)
            getPartnerById(partnerId).then(res => {
                if (res)
                    setPartner(res)
                else
                    setnotFound(true)

            }).catch(err => {
                setnotFound(err)
            })


    }, [partnerId])

    if (notFound) {
        return <NotFound />
    }



    if (!partner) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }


    return (
        <div className='personal_info display_flex flex_flow_wrap justify_content_center '>
            <div className='info_card  display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('name')} </span>
                <span>{partner.name}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('lastName')} </span>
                <span>{partner.lastName}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('phoneNumber')} </span>
                <span>{partner.phoneNumber}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('email')} </span>
                <span>{partner.email}</span>
            </div>
            {authentication?.roles?.includes('SUPER_ADMIN') &&
                <div className='info_card position_relative display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                    <span
                        className='position_absolute show_pass'
                        onClick={() => setshowPassword(!showPassword)}>
                        <i className={showPassword ? ICONS.eyeSlashFill : ICONS.eyeFill}></i>
                    </span>
                    <span>{t('password')} </span>
                    {showPassword && <span>{partner.password}</span>}
                    {!showPassword && <span>******</span>}

                </div>
            }
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('createdDate')} </span>
                <span>{partner?.createdDate && formatFirebaseDates(partner?.createdDate)}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('joinedDate')} </span>
                <span>{partner?.joinedDate && formatFirebaseDates(partner?.joinedDate)}</span>
            </div>
            <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                <span>{t('capital')} </span>
                <span>
                    {partner?.capitalHistory?.length > 0 ? partner.capitalHistory[partner.capitalHistory.length - 1].amount : partner.initialCapital}
                </span>
            </div>
        </div >
    )
}


export default PartnerPersonalInformation