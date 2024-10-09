import React, { useEffect, useState } from 'react'
import PersonalInformation from './PeronsalInformation/PersonalInformation';
import CustomerProductPurchases from './CustomerProductPurchases/CustomerProductPurchases';
import { useNavigate, useParams } from 'react-router-dom';
import { useStateValue } from '../../../context/StateProvider';
import usePersistentComponent from '../../../Hooks/usePersistentComponent';
import { collection, deleteDoc, doc, getDoc, query, where } from 'firebase/firestore';
import { actionTypes } from '../../../context/reducer';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import CardLoadingTemplate from '../../UI/LoadingTemplate/CardLoadingTemplate';
import HeadingMenuTemplate from '../../UI/LoadingTemplate/HeadingMenuTemplate';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import Button from '../../UI/Button/Button';
import Menu from '../../UI/Menu/Menu';
import ICONS from '../../../constants/Icons';
import TabMenu from '../../UI/TabMenu/TabMenu';
import { t } from 'i18next';
import NotFound from '../../../pages/NotFound/NotFound';
import { db } from '../../../constants/FirebaseConfig';
import { toast } from 'react-toastify';
import Collections from '../../../constants/Collections';
import { disableUserAccountBy, enableUserAccountBy, getUserByEmail, getUserImage } from '../../../Utils/FirebaseTools.ts';
import DisplayLogo from "../../UI/DisplayLogo/DisplayLogo"
import CustomerPayments from './CsutomerPayments/CustomerPayments';
import ButtonLoadingTemplate from '../../UI/LoadingTemplate/ButtonLoadingTemplate';
import AvatarLoadingTemplate from '../../UI/LoadingTemplate/AvatarLoadingTemplate';


// components for tabs
const components = {
    PersonalInformation: {
        componentName: "PersonalInformation",
        component: PersonalInformation,
    },
    CustomerProductPurchases: { componentName: "CustomerProductPurchases", component: CustomerProductPurchases },
    CustomerPayments: { componentName: "CustomerPayments", component: CustomerPayments },
};


function Customer() {
    const { customerId } = useParams();
    const [{ authentication }, dispatch] = useStateValue()
    const navigate = useNavigate();
    const usersCollectionRef = collection(db, Collections.Users);
    const [imageURL, setimageURL] = useState();
    const [user, setUser] = useState();

    const [customer, setCustomer] = useState()
    const [displayComponent, setDisplayComponent] = usePersistentComponent(
        components,
        "PersonalInformation"
    );

    const [notFound, setnotFound] = useState()

    useEffect(() => {
        const getData = async () => {
            try {
                const data = await getDoc(doc(db, Collections.Customers, customerId));
                if (data.exists()) {
                    const email = data.data().email
                    const url = await getUserImage(email);
                    getUserByEmail(email)
                        .then(res => {
                            setUser(res)
                        });

                    setimageURL(url)
                    setCustomer({ ...data.data(), id: data.id })
                }
            } catch (err) {
                console.log(err);
            }
        }
        getData();
    }, [customerId])

    const showDeleteModal = () => {
        dispatch({
            type: actionTypes.SHOW_ASKING_MODAL,
            payload: {
                show: true,
                message: "deleteMessage",
                btnAction: removeEmployee,
                id: customerId,
            },
        });
    };



    const lockOrUnlockStudentAccount = () => {
        dispatch({
            type: actionTypes.SET_SMALL_LOADING,
            payload: true
        })
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
        const customerDoc = doc(db, Collections.Customers, customerId)
        const q = query(usersCollectionRef, where("originalEntityId", "==", customerId))
        const userDoc = doc(db, Collections.Users, customerId)
        try {
            await deleteDoc(customerDoc)
            await deleteDoc(userDoc);

            navigate("/customers");
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




    console.log(customer);


    if (notFound) {
        return <NotFound />;
    }

    if (!customer) {
        return (
            <LoadingTemplateContainer>
                <LoadingTemplateContainer className="display_flex justify_content_space_between align_items_center ">
                    <ButtonLoadingTemplate />
                    <AvatarLoadingTemplate size="xlarge" />
                </LoadingTemplateContainer>
                <HeadingMenuTemplate />
                <ShotLoadingTemplate />
            </LoadingTemplateContainer>
        );
    }
    console.log(authentication);


    return (
        <div className='employee'>
            <section
                className={`profile_header display_flex ${authentication.roles.includes('ADMIN') || authentication.roles.includes('SUPER_ADMIN') ? 'justify_content_space_between' : 'justify_content_end'} `}>
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
                    <h1>
                        {customer?.name}{" "}
                        {customer?.lastName}
                    </h1>
                    <DisplayLogo imgURL={imageURL} />
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
                            components?.CustomerProductPurchases?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent(components?.CustomerProductPurchases)}
                >
                    {t('factors')}
                </li>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.CustomerPayments?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent(components?.CustomerPayments)}
                >
                    {t('customerAccount')}
                </li>
            </TabMenu>

            <div>
                {<displayComponent.component data={customer} />}
            </div>

        </div >
    )
}

export default Customer