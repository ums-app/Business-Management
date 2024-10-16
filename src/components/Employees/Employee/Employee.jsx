import { deleteDoc, doc, getDoc } from 'firebase/firestore';
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
import { toast } from 'react-toastify';
import DisplayLogo from '../../UI/DisplayLogo/DisplayLogo';
import { disableUserAccountBy, enableUserAccountBy, getUserByEmail, getUserImage } from '../../../Utils/FirebaseTools.ts';
import EmployeePayments from './EmployeePayments/EmployeePayments';
import EmployeeFee from './EmployeeFee/EmployeeFee';
import EmployeeSalaries from './EmployeeSalaries/EmployeeSalaries';
import ButtonLoadingTemplate from '../../UI/LoadingTemplate/ButtonLoadingTemplate';
import AvatarLoadingTemplate from "../../UI/LoadingTemplate/AvatarLoadingTemplate"
import { VisitorContractType } from '../../../constants/Others.js';


// components for tabs
const components = {
    PersonalInformation: {
        componentName: "PersonalInformation",
        component: PersonalInformation,
    },
    Customers: { componentName: "customers", component: EmployeeCustomers },
    Salaries: { componentName: "salaries", component: EmployeeSalaries },
    Payments: { componentName: 'payments', component: EmployeePayments },
    EmployeeFee: { componentName: 'employeeFee', component: EmployeeFee },
};


function Employee() {
    const { employeeId } = useParams();
    const [{ authentication }, dispatch] = useStateValue()
    const navigate = useNavigate();
    const [user, setUser] = useState()
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
                    const email = data.data().email
                    const url = await getUserImage(email);
                    getUserByEmail(email)
                        .then(res => {
                            setUser(res)
                        });

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

    if (!authentication.roles.includes(Roles.ADMIN) || !authentication.roles.includes(Roles.SUPER_ADMIN)) {
        navigate('/')
    }

    if (notFound) {
        return <NotFound />;
    }

    if (!employee) {
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
        <div className='employee'>
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
                            components?.Salaries?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent(components?.Salaries)}
                >
                    {t("salaries")}
                </li>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.Payments?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent(components?.Payments)}
                >
                    {t("receipts")}
                </li>
                {employee.visitorContractType != VisitorContractType.NONE && <li
                    className={
                        displayComponent?.componentName ==
                            components?.Customers?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent(components?.Customers)}
                >
                    {t("customers")}
                </li>}
                {employee.visitorContractType != VisitorContractType.NONE &&
                    <li
                        className={
                            displayComponent?.componentName ==
                                components?.EmployeeFee?.componentName
                                ? "active"
                                : ""
                        }
                        onClick={() => setDisplayComponent(components?.EmployeeFee)}
                    >
                        {t("employeeAccount")}
                    </li>
                }
            </TabMenu>

            <div>
                {<displayComponent.component data={employee} setData={setemployee} />}
            </div>

        </div>
    )
}

export default Employee