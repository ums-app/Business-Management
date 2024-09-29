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
import { getUserImage } from '../../../Utils/FirebaseTools';
import DisplayLogo from "../../UI/DisplayLogo/DisplayLogo"
import CustomerPayments from './CsutomerPayments/CustomerPayments';


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
    const [, dispatch] = useStateValue()
    const navigate = useNavigate();
    const usersCollectionRef = collection(db, Collections.Users);
    const [imageURL, setimageURL] = useState();

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
                    const url = await getUserImage(data.data().email)
                    setimageURL(url)
                    setCustomer(data.data())
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



    const lockOrUnlockStudentAccount = () => { }

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
                <CardLoadingTemplate />
                <HeadingMenuTemplate />
                <ShotLoadingTemplate />
            </LoadingTemplateContainer>
        );
    }

    return (
        <div className='employee'>
            <section className="profile_header display_flex justify_content_space_between">
                {/* Profile Menu */}
                <Menu >
                    <Button
                        icon={ICONS.trash}
                        text={t("delete")}
                        onClick={showDeleteModal}
                    />
                    {/* <Button
                        icon={customer?.isEnable ? ICONS.lockFill : ICONS.unlock}
                        onClick={lockOrUnlockStudentAccount}
                        text={customer?.isEnable ? t("disable") : t("enable")}
                    /> */}
                    <Button
                        icon={ICONS.edit}
                        text={t("updateInformation")}
                        onClick={() =>
                            navigate("update")
                        }
                    />
                </Menu>

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
                    {t('payments')}
                </li>
            </TabMenu>

            <div>
                {<displayComponent.component data={customer} />}
            </div>

        </div >
    )
}

export default Customer