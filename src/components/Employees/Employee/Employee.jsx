import { collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../../../constants/FirebaseConfig';
import usePersistentComponent from '../../../Hooks/usePersistentComponent';
import TabMenu from '../../UI/TabMenu/TabMenu';
import Button from '../../UI/Button/Button';
import EmployeeCustomers from './EmployeeCustomers/EmployeeCustomers';
import PersonalInformation from './PersonalInformation/PersonalInformation';
import Menu from "../../UI/Menu/Menu"
import { t } from 'i18next';
import ICONS from '../../../constants/Icons';
import { actionTypes } from '../../../context/reducer';
import { useStateValue } from '../../../context/StateProvider';
import NotFound from '../../../pages/NotFound/NotFound';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import HeadingMenuTemplate from '../../UI/LoadingTemplate/HeadingMenuTemplate';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import CardLoadingTemplate from '../../UI/LoadingTemplate/CardLoadingTemplate';
import { toast } from 'react-toastify';
import DisplayLogo from '../../UI/DisplayLogo/DisplayLogo';
import { getUserImage } from '../../../Utils/FirebaseTools';


// components for tabs
const components = {
    PersonalInformation: {
        componentName: "PersonalInformation",
        component: PersonalInformation,
    },
    Customers: { componentName: "customers", component: EmployeeCustomers },

};


function Employee() {
    const { employeeId } = useParams();
    const [, dispatch] = useStateValue()
    const navigate = useNavigate();

    const [employee, setemployee] = useState()
    const [displayComponent, setDisplayComponent] = usePersistentComponent(
        components,
        "PersonalInformation"
    );
    const [imageURL, setImageURL] = useState();

    const [notFound, setnotFound] = useState()

    useEffect(() => {
        const getData = async () => {
            try {
                const data = await getDoc(doc(db, 'Employees', employeeId));
                if (data.exists()) {
                    const url = await getUserImage(data.data().email)
                    setImageURL(url)
                    setemployee(data.data())
                }
            } catch (err) {
                console.log(err);
            }
        }
        getData();
    }, [employeeId])

    const showDeleteModal = () => {
        dispatch({
            type: actionTypes.SHOW_ASKING_MODAL,
            payload: {
                show: true,
                message: "deleteMessage",
                btnAction: removeEmployee,
                id: employeeId,
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
        const employeeDoc = doc(db, 'Employees', employeeId)
        try {
            await deleteDoc(employeeDoc)
            navigate("/employees");
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




    console.log(employee);


    if (notFound) {
        return <NotFound />;
    }

    if (!employee) {
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
                        icon={employee?.isEnable ? ICONS.lockFill : ICONS.unlock}
                        onClick={lockOrUnlockStudentAccount}
                        text={employee?.isEnable ? t("disable") : t("enable")}
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
                        {employee?.name}{" "}
                        {employee?.lastName}
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
                            components?.Customers?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent(components?.Customers)}
                >
                    {t("customers")}
                </li>
            </TabMenu>

            <div>
                {<displayComponent.component data={employee} />}
            </div>

        </div>
    )
}

export default Employee