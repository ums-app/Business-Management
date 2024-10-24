import React, { useEffect, useState } from 'react'
import { CustomerForSaleFactor, Employee, ImageUrls } from '../../../Types/Types'
import { getCustomers, getCustomersByCustomerTypes, getEmployees, getUserImage } from '../../../Utils/FirebaseTools'
import { CustomerType } from '../../../constants/Others'
import { t } from 'i18next'
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate'
import DisplayLogo from '../../UI/DisplayLogo/DisplayLogo'
import { useNavigate } from 'react-router-dom'


const CustomerListOnCustomerType: React.FC = () => {
    const [customers, setcustomers] = useState<CustomerForSaleFactor[]>([])
    const [loading, setloading] = useState(true)
    const [imageUrls, setImageUrls] = useState<ImageUrls>()
    const [employees, setemployees] = useState<Employee[]>([]);
    const nav = useNavigate();

    useEffect(() => {
        getCustomersByCustomerTypes([CustomerType.OTHER_CITY, CustomerType.DISTRICT])
            .then(res => setcustomers(res))
            .finally(() => setloading(false))

        getEmployees()
            .then(res => setemployees(res))
    }, [])


    useEffect(() => {
        const fetchImages = async () => {
            const newImageUrls: ImageUrls = {};
            await Promise.all(
                customers.map(async (item) => {

                    try {
                        const url = await getUserImage(item.email);
                        newImageUrls[item.email] = url; // Store image URL by email
                    } catch (err) {

                    }
                })
            );
            setImageUrls(newImageUrls); // Update state with all image URLs
        };

        if (customers) {
            fetchImages();
        }
    }, [customers]);

    return (
        <div>
            <div className='table_container '>
                {loading ? <ShotLoadingTemplate /> :
                    <table className="full_width custom_table table_row_hover overflow_hidden">
                        <thead >
                            <tr>
                                <th>#</th>
                                <th>{t('image')}</th>
                                <th>{t('name')}</th>
                                <th>{t('lastName')}</th>
                                <th>{t('location')}</th>
                                <th>{t('phoneNumber')}</th>
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
                                    <td>
                                        <DisplayLogo imgURL={imageUrls[emp.email]} height='60px' width='60px' alt={t('user') + " " + t('image')} />
                                    </td>
                                    <td>{emp.name}</td>
                                    <td>{emp.lastName}</td>
                                    <td>{emp.location}</td>
                                    <td>{emp.phoneNumber}</td>
                                    <td>{visitor?.name} {visitor?.lastName}</td>
                                </tr>
                            })
                            }
                            {customers?.length == 0 && <tr>
                                <td colSpan={7}>{t('notExist')}</td>
                            </tr>}
                        </tbody>
                    </table>
                }
            </div>
        </div>
    )
}

export default CustomerListOnCustomerType