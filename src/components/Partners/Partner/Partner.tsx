import React, { useEffect, useState } from 'react'
import { Partner, User } from '../../../Types/Types'
import { disableUserAccountBy, enableUserAccountBy, getPartnerById, getPartners, getUserByEmail, getUserImage } from '../../../Utils/FirebaseTools';
import { useNavigate, useParams } from 'react-router-dom';
import PartnerPersonalInformation from './PartnerPaersonalInformation/PartnerPersonalInformation';
import PartnerWithdraw from './PartnerWithdraw/PartnerWithdraw';
import { useStateValue } from '../../../context/StateProvider';
import usePersistentComponent from '../../../Hooks/usePersistentComponent';
import { actionTypes } from '../../../context/reducer';
import { deleteDoc, doc } from 'firebase/firestore';
import Collections from '../../../constants/Collections';
import { db } from '../../../constants/FirebaseConfig';
import { toast } from 'react-toastify';
import Circle from '../../UI/Loading/Circle';
import Roles from '../../../constants/Roles';
import NotFound from '../../../pages/NotFound/NotFound';
import { UserTypes } from '../../../constants/Others';
import { t } from 'i18next';
import TabMenu from '../../UI/TabMenu/TabMenu';
import DisplayLogo from '../../UI/DisplayLogo/DisplayLogo';
import Button from '../../UI/Button/Button';
import ICONS from '../../../constants/Icons';
import Menu from '../../UI/Menu/Menu';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ButtonLoadingTemplate from '../../UI/LoadingTemplate/ButtonLoadingTemplate';
import AvatarLoadingTemplate from '../../UI/LoadingTemplate/AvatarLoadingTemplate';
import HeadingMenuTemplate from '../../UI/LoadingTemplate/HeadingMenuTemplate';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';

// components for tabs
const components = {
    PersonalInformation: {
        componentName: "PersonalInformation",
        component: PartnerPersonalInformation,
    },
    Withdraw: { componentName: "withdrawals", component: PartnerWithdraw },

};


const PartnerPage: React.FC = () => {
    const [partner, setpartner] = useState<Partner>();
    const { partnerId } = useParams();
    const [{ authentication }, dispatch] = useStateValue()
    const navigate = useNavigate();
    const [user, setUser] = useState<User>()
    const [displayComponent, setDisplayComponent] = usePersistentComponent(
        components,
        "PersonalInformation"
    );

    const [imageURL, setImageURL] = useState<string>();
    const [notFound, setnotFound] = useState()


    useEffect(() => {
        if (partnerId) {
            getPartnerById(partnerId)
                .then(res => {
                    getUserImage(res.email)
                        .then(img => setImageURL(img));

                    getUserByEmail(res.email)
                        .then(u => {
                            setUser(u)
                        });
                    setpartner(res)

                })
        }
    }, [partnerId])


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


    const lockOrUnlockStudentAccount = () => {
        dispatch({
            type: actionTypes.SET_SMALL_LOADING,
            payload: true
        })
        if (!user) return;

        if (user.disabled) {
            enableUserAccountBy(user)
                .then(res => {
                    setUser({
                        ...user,
                        disabled: false
                    })
                    console.log(res);
                })
                .finally(() => {
                    dispatch({
                        type: actionTypes.SET_SMALL_LOADING,
                        payload: false
                    })
                })
        } else {
            disableUserAccountBy(user)
                .then(res => {
                    setUser({
                        ...user,
                        disabled: true
                    })
                    console.log(res);

                })
                .finally(() => {
                    dispatch({
                        type: actionTypes.SET_SMALL_LOADING,
                        payload: false
                    })
                })
        }

    }

    const removeEmployee = async () => {
        dispatch({
            type: actionTypes.SET_GLOBAL_LOADING,
            payload: { value: true },
        });
        dispatch({
            type: actionTypes.HIDE_ASKING_MODAL,
        });
        const employeeDoc = doc(db, Collections.Partners, partnerId)
        try {
            await deleteDoc(employeeDoc)
            navigate("/employees");
            toast.success('successfullyDeleted')
        } catch (err) {
            toast.error(err.message)
        } finally {
            dispatch({
                type: actionTypes.SET_GLOBAL_LOADING,
                payload: { value: false },
            });
        }
    };



    if (!authentication.isAuthenticated) {
        return <Circle />; // or return null; for no UI during loading
    }

    if (!authentication.roles.includes(Roles.ADMIN) && !authentication.roles.includes(Roles.SUPER_ADMIN) && authentication.userType != UserTypes.PARTNER) {
        return <NotFound />
    }


    if (notFound) {
        return <NotFound />;
    }

    if (!partner) {
        return (
            <LoadingTemplateContainer>
                <LoadingTemplateContainer className="display_flex justify_content_space_between align_items_center">
                    <ButtonLoadingTemplate />
                    <AvatarLoadingTemplate size="xlarge" />
                </LoadingTemplateContainer>
                <HeadingMenuTemplate />
                <ShotLoadingTemplate />
            </LoadingTemplateContainer>
        );
    }



    return (
        <div>
            <section className="profile_header display_flex justify_content_space_between">
                {/* Profile Menu */}
                {authentication.roles.includes('ADMIN') || authentication.roles.includes('SUPER_ADMIN') &&
                    <Menu >
                        <Button
                            icon={ICONS.trash}
                            text={t("delete")}
                            onClick={showDeleteModal}
                        />

                        {authentication.roles.includes('SUPER_ADMIN') &&
                            <Button
                                icon={!user?.disabled ? ICONS.lockFill : ICONS.unlock}
                                onClick={lockOrUnlockStudentAccount}
                                text={!user?.disabled ? t("disable") : t("enable")}
                            />
                        }
                        <Button
                            icon={ICONS.edit}
                            text={t("updateInformation")}
                            onClick={() =>
                                navigate("update")
                            }
                        />
                    </Menu>
                }

                {/* User Profile Image */}
                <div className=" display_flex align_items_center" >
                    <h1 className='margin_right_10 margin_left_10'>
                        {partner?.name}{" "}
                        {partner?.lastName}
                    </h1>
                    <DisplayLogo imgURL={imageURL} alt={'user-img'} />
                </div>
            </section>


            {/* the navbar of the profile page */}

            <TabMenu>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.PersonalInformation?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent(components?.PersonalInformation)}
                >
                    {t("personalInformation")}
                </li>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.Withdraw?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent(components?.Withdraw)}
                >
                    {t("withdrawals")}
                </li>

            </TabMenu>

            <div>
                {<displayComponent.component data={partner} setData={setpartner} />}
            </div>
        </div>
    )
}

export default PartnerPage