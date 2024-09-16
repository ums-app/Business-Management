import React, { useEffect, useState } from 'react'
import Modal from '../UI/modal/Modal'
import { t } from 'i18next'
import Button from '../UI/Button/Button'
import { toast } from 'react-toastify'
import AddEmployee from './AddEmployee/AddEmployee'
import { db } from '../../constants/FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'
import LoadingTemplateContainer from "../UI/LoadingTemplate/LoadingTemplateContainer"
import HeadingMenuTemplate from "../UI/LoadingTemplate/HeadingMenuTemplate"
import ShotLoadingTemplate from "../UI/LoadingTemplate/ShotLoadingTemplate"
import ButtonLoadingTemplate from "../UI/LoadingTemplate/ButtonLoadingTemplate"



function Employees() {
    const nav = useNavigate();

    const [employees, setEmployees] = useState();
    const employeesCollectionRef = collection(db, 'Employees');

    useEffect(() => {

        const fetchData = async () => {
            const querySnapshot = await getDocs(employeesCollectionRef);
            const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setEmployees(items);

            console.log(items);
        };

        fetchData();
    }, []);


    if (!employees) {
        return (
            <LoadingTemplateContainer>
                <ButtonLoadingTemplate />
                <HeadingMenuTemplate />
                <ShotLoadingTemplate />
            </LoadingTemplateContainer>
        );
    }



    const sendDataToAPI = () => {
        toast.success("data added")
    }

    return (
        <div>
            <Button
                text={t('add') + " " + t('employee')}
                onClick={() => nav("add")}
            />



            <div className='display_flex justify_content_space_between align_items_center'>
                {/* {employees.map(item => {
                    return <div className='margin_10'>
                        {item.name}
                    </div>
                })} */}
            </div>


            <h1 className='margin_10 title'>{t('employees')}</h1>

            <div className='table_container '>
                <table className="full_width custom_table table_row_hover">
                    <thead >
                        <tr>
                            <th>{t('number')}</th>
                            <th>{t('name')}</th>
                            <th>{t('lastName')}</th>
                            <th>{t('jobTitle')}</th>
                            <th>{t('phoneNumber')}</th>
                            <th>{t('salary')}</th>
                            <th>{t('percent')} {t('sales')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees?.map((emp, index) => {
                            return <tr
                                className=" cursor_pointer hover"
                                onClick={() => nav('/employees/' + emp.id)}
                                key={emp.id}
                            >
                                <td>{index + 1}</td>
                                <td>{emp.name}</td>
                                <td>{emp.lastName}</td>
                                <td>{emp.jobTitle} </td>
                                <td>{emp.phoneNumber}</td>
                                <td>{emp.salary}</td>
                                <td>{emp.salesPercent}%</td>
                            </tr>
                        })
                        }


                    </tbody>
                </table>
            </div>



        </div>
    )
}



export default Employees