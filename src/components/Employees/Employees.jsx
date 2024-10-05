import React, { useEffect, useState } from 'react'
import { t } from 'i18next'
import Button from '../UI/Button/Button'
import { toast } from 'react-toastify'
import { db } from '../../constants/FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'
import LoadingTemplateContainer from "../UI/LoadingTemplate/LoadingTemplateContainer"
import HeadingMenuTemplate from "../UI/LoadingTemplate/HeadingMenuTemplate"
import ShotLoadingTemplate from "../UI/LoadingTemplate/ShotLoadingTemplate"
import ButtonLoadingTemplate from "../UI/LoadingTemplate/ButtonLoadingTemplate"
import { getUserImage } from '../../Utils/FirebaseTools.ts'



function Employees() {
    const nav = useNavigate();

    const [employees, setEmployees] = useState();
    const employeesCollectionRef = collection(db, 'Employees');
    const [imageUrls, setImageUrls] = useState();


    useEffect(() => {

        const fetchData = async () => {
            const querySnapshot = await getDocs(employeesCollectionRef);
            const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setEmployees(items);

            console.log(items);
        };

        fetchData();
    }, []);


    useEffect(() => {
        const fetchImages = async () => {
            const newImageUrls = {};
            await Promise.all(
                employees.map(async (item) => {
                    try {
                        const url = await getUserImage(item.email);
                        console.log(url);
                        newImageUrls[item.email] = url; // Store image URL by email
                    } catch (err) {
                        newImageUrls[item.email] = 'default';
                        console.log(`Error fetching image for ${item.email}:`, err);
                    }
                })
            );
            setImageUrls(newImageUrls); // Update state with all image URLs
            console.log(newImageUrls);
        };

        if (employees) {
            fetchImages();
        }
    }, [employees]);



    useEffect(() => {
        const fetchImages = async () => {
            const newImageUrls = {};
            await Promise.all(
                employees.map(async (item) => {
                    const url = await getUserImage(item.email);
                    newImageUrls[item.email] = url; // Store image URL by product ID
                })
            );
            setImageUrls(newImageUrls); // Update state with all image URLs
        };

        if (employees) {
            fetchImages();
        }
    }, [employees]);


    if (!employees || !imageUrls) {
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
                            <th>{t('image')}</th>
                            <th>{t('name')}</th>
                            <th>{t('lastName')}</th>
                            <th>{t('jobTitle')}</th>
                            <th>{t('phoneNumber')}</th>
                            <th>{t('salary')}</th>
                            {/* <th>{t('percent')} {t('sales')}</th> */}
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
                                <td><img src={imageUrls[emp.email]} alt={t('user') + " " + t('image')} className='user_profile_img' /></td>
                                <td>{emp.name}</td>
                                <td>{emp.lastName}</td>
                                <td>{emp.jobTitle} </td>
                                <td>{emp.phoneNumber}</td>
                                <td>{emp.salary}</td>
                                {/* <td>{emp.salesPercent}%</td> */}
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