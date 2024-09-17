import React, { useEffect, useState } from 'react'
import PersonalInformation from './PeronsalInformation/PersonalInformation';
import CustomerBuyingProducts from './CustomerBuyingProducts/CustomerBuyingProducts';
import { useNavigate, useParams } from 'react-router-dom';
import { useStateValue } from '../../../context/StateProvider';
import usePersistentComponent from '../../../Hooks/usePersistentComponent';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
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


// components for tabs
const components = {
    PersonalInformation: {
        componentName: "PersonalInformation",
        component: PersonalInformation,
    },
    BuyingProducts: { componentName: "BuyingProducts", component: CustomerBuyingProducts },

};


function Customer() {
    const { customerId } = useParams();
    const [, dispatch] = useStateValue()
    const navigate = useNavigate();

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
        try {
            await deleteDoc(customerDoc)
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
                <div className="user_profile_img display_flex align_items_center flex_direction_column">
                    {/* <img
                        src={employee?.imageUrl}
                        alt="user img"
                        crossOrigin="anonymous"
                    /> */}
                    <h1>
                        {customer?.name}{" "}
                        {customer?.lastName}
                    </h1>
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
                            components?.BuyingProducts?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent(components?.BuyingProducts)}
                >
                    {t('purchases')}
                </li>
            </TabMenu>

            <div>
                {<displayComponent.component data={customer} />}
            </div>

        </div>
    )
}

export default Customer