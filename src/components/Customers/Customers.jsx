
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../UI/Button/Button'
import { t } from 'i18next'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../constants/FirebaseConfig'
import LoadingTemplateContainer from '../UI/LoadingTemplate/LoadingTemplateContainer'
import ButtonLoadingTemplate from '../UI/LoadingTemplate/ButtonLoadingTemplate'
import HeadingMenuTemplate from '../UI/LoadingTemplate/HeadingMenuTemplate'
import ShotLoadingTemplate from '../UI/LoadingTemplate/ShotLoadingTemplate'
import Collections from '../../constants/Collections'
import { getUserImage } from '../../Utils/FirebaseTools'


function Customers() {
    const nav = useNavigate();
    const customersCollectionRef = collection(db, Collections.Customers);
    const employeesCollectionRef = collection(db, Collections.Employees);

    const [customers, setCustomers] = useState();
    const [employees, setEmployees] = useState()
    const [imageUrls, setImageUrls] = useState()

    useEffect(() => {
        getCustomers();
        getEmployees();

    }, []);


    useEffect(() => {
        const fetchImages = async () => {
            const newImageUrls = {};
            await Promise.all(
                customers.map(async (item) => {
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

        if (customers) {
            fetchImages();
        }
    }, [customers]);




    const getCustomers = async () => {
        const querySnapshot = await getDocs(customersCollectionRef);
        const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setCustomers(items);

        console.log(items);
    };


    const getEmployees = async () => {
        const querySnapshot = await getDocs(employeesCollectionRef);
        const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setEmployees(items);

        console.log(items);
    };


    if (!customers || !employees || !imageUrls) {
        return (
            <LoadingTemplateContainer>
                <ButtonLoadingTemplate />
                <HeadingMenuTemplate />
                <ShotLoadingTemplate />
            </LoadingTemplateContainer>
        );
    }


    console.log(customers);
    console.log(employees);


    return (
        <div>
            <Button
                text={t('add') + " " + t('customer')}
                onClick={() => nav('add')}
            />


            <h1 className='margin_10 title'>{t('customers')}</h1>

            <div className='table_container '>
                <table className="full_width custom_table table_row_hover">
                    <thead >
                        <tr>
                            <th>{t('number')}</th>
                            <th>{t('image')}</th>
                            <th>{t('name')}</th>
                            <th>{t('lastName')}</th>
                            <th>{t('name')} {t('organization')}</th>
                            <th>{t('phoneNumber')}</th>
                            <th>{t('location')}</th>
                            <th>{t('visitor')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers?.map((emp, index) => {

                            const visitor = employees.find(item => item.id == emp.visitor)

                            return <tr
                                className=" cursor_pointer hover"
                                onClick={() => nav('/customers/' + emp.id)}
                                key={emp.id}
                            >
                                <td>{index + 1}</td>
                                <td><img src={imageUrls[emp.email]} alt={t('user') + " " + t('image')} className='user_profile_img' /></td>
                                <td>{emp.name}</td>
                                <td>{emp.lastName}</td>
                                <td>{emp.organizationName} </td>
                                <td>{emp.phoneNumber}</td>
                                <td>{emp.location}</td>
                                <td>{visitor?.name} {visitor?.lastName}</td>
                            </tr>
                        })
                        }


                    </tbody>
                </table>
            </div>




        </div>
    )
}





export default Customers