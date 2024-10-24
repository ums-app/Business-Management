import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRepresentorById, getUserImage, sendLog } from '../../Utils/FirebaseTools';
import { Representation } from '../../Types/Types';
import { t } from 'i18next';
import { formatFirebaseDates } from '../../Utils/DateTimeUtils';
import ShotLoadingTemplate from '../UI/LoadingTemplate/ShotLoadingTemplate';
import DisplayLogo from '../UI/DisplayLogo/DisplayLogo';
import Button from '../UI/Button/Button';
import Menu from '../UI/Menu/Menu';
import { useStateValue } from '../../context/StateProvider';
import ICONS from '../../constants/Icons';
import { actionTypes } from '../../context/reducer';
import Collections from '../../constants/Collections';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../constants/FirebaseConfig';
import { toast } from 'react-toastify';

const Representor = () => {
    const { representorId } = useParams();
    const [representor, setrepresentor] = useState<Representation>()
    const [customerImg, setcustomerImg] = useState<string>()
    const [{ authentication }, dispatch] = useStateValue()
    const navigate = useNavigate()


    useEffect(() => {
        if (representorId)
            getRepresentorById(representorId)
                .then(res => {
                    setrepresentor(res)
                    getUserImage(res.customer.email)
                        .then(url => setcustomerImg(url))
                })
    }, [representorId])



    const showDeleteModal = () => {
        dispatch({
            type: actionTypes.SHOW_ASKING_MODAL,
            payload: {
                show: true,
                message: "deleteMessage",
                btnAction: removeEmployee,
            },
        });
    };



    const removeEmployee = async () => {
        dispatch({
            type: actionTypes.SET_GLOBAL_LOADING,
            payload: { value: true },
        });
        dispatch({
            type: actionTypes.HIDE_ASKING_MODAL,
        });
        const customerDoc = doc(db, Collections.Representations, representorId)
        try {
            await deleteDoc(customerDoc)
            const log = {
                createdDate: new Date(),
                registrar: `${authentication.name} ${authentication.lastname}`, // Assume you have a way to track the current user
                title: `${t('delete')} ${t('customer')}`,
                message: `${t('representor')} [${representor?.customer.name} ${representor?.customer.lastName}] ${t('successfullyDeleted')}`,
                data: { ...representor, id: representorId }
            };
            await sendLog(log);

            navigate("/representations");
            toast.success('successfullyDeleted')
        } catch (err) {
            toast.success(err.message)
        } finally {
            dispatch({
                type: actionTypes.SET_GLOBAL_LOADING,
                payload: { value: false },
            });
        }
    };








    if (!representor) {
        return <ShotLoadingTemplate />
    }

    return (
        <div>
            {/* Profile Menu */}
            {authentication.roles.includes('ADMIN') || authentication.roles.includes('SUPER_ADMIN') &&
                <Menu >
                    <Button
                        icon={ICONS.trash}
                        text={t("delete")}
                        onClick={showDeleteModal}
                    />
                    <Button
                        icon={ICONS.edit}
                        text={t("updateInformation")}
                        onClick={() =>
                            navigate("update")
                        }
                    />
                </Menu>
            }
            {representor.customer &&
                <div className='input margin_top_10 display_flex flex_direction_column'>
                    <p className='title_2s'>{t('details')} {t('customer')}</p>

                    <DisplayLogo imgURL={customerImg} alt={'img'} />
                    <div className='display_flex justify_content_center full_width'>

                        <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                            <span >{t('name')} </span>
                            <span>{representor.customer?.name}</span>
                        </div>
                        <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                            <span>{t('lastName')} </span>
                            <span>{representor.customer?.lastName}</span>
                        </div>
                        <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                            <span>{t('location')} </span>
                            <span>{representor.customer?.location}</span>
                        </div>
                        <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                            <span>{t('phoneNumber')} </span>
                            <span>{representor.customer?.phoneNumber}</span>
                        </div>
                        <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                            <span>{t('customerType')} </span>
                            <span>{t(representor.customer?.customerType)}</span>
                        </div>
                        <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                            <span>{t('createdDate')} </span>
                            <span>{representor.customer?.createdDate && formatFirebaseDates(representor.customer.createdDate)}</span>
                        </div>
                        <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                            <span>{t('joinedDate')} </span>
                            <span>{representor.customer?.joinedDate && formatFirebaseDates(representor.customer.joinedDate)}</span>
                        </div>
                    </div>
                </div>
            }

            <div className='input margin_top_10 display_flex margin_bottom_10 padding_20'>
                <div className='display_flex flex_direction_column margin_left_10 margin_right_10 padding_20'>
                    <span>{t('amountOfLoan')}</span>
                    <span>{representor.amountOfLoan}</span>
                </div>
                <div className='display_flex flex_direction_column margin_left_10 margin_right_10 padding_20'>
                    <span >{t('currencyType')}</span>
                    <span>{t(representor.currencyType)}</span>

                </div>
                <div className='display_flex flex_direction_column margin_left_10 margin_right_10 padding_20' style={{ direction: "rtl" }}>
                    <span >{t('createdDate')}</span>
                    <span>{formatFirebaseDates(representor.createdDate)}</span>
                </div>
            </div>


        </div >
    )
}

export default Representor