import React, { useEffect, useState } from 'react'
import { Partner } from '../../Types/Types'
import Button from '../UI/Button/Button'
import { t } from 'i18next'
import { formatFirebaseDates } from '../../Utils/DateTimeUtils'
import { useNavigate } from 'react-router-dom'
import { getPartners, getUserImage } from '../../Utils/FirebaseTools'
import { useStateValue } from '../../context/StateProvider'
import NotFound from '../../pages/NotFound/NotFound'
import Circle from '../UI/Loading/Circle'
import Roles from '../../constants/Roles'

const Partners: React.FC = () => {
    const [partners, setpartners] = useState<Partner[]>([])
    const [imageUrls, setImageUrls] = useState({});
    const nav = useNavigate();
    const [{ authentication }, dispatch] = useStateValue()


    useEffect(() => {
        getPartners()
            .then(res => {
                setpartners(res)
            })
    }, [])



    useEffect(() => {
        const fetchImages = async () => {
            const newImageUrls = {};
            await Promise.all(
                partners.map(async (item) => {
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

        if (partners) {
            fetchImages();
        }
    }, [partners]);


    if (!authentication.isAuthenticated) {
        return <Circle />; // or return null; for no UI during loading
    }



    if (!authentication.roles.includes(Roles.SUPER_ADMIN)) {
        return <NotFound />
    }


    return (
        <div>
            <Button
                text={t('add') + " " + t('partner')}
                onClick={() => nav("add")}
            />
            <h1 className='margin_10 title'>{t('partners')}</h1>

            <div className='table_container '>
                <table className="full_width custom_table table_row_hover">
                    <thead >
                        <tr>
                            <th>{t('number')}</th>
                            <th>{t('image')}</th>
                            <th>{t('name')}</th>
                            <th>{t('lastName')}</th>
                            <th>{t('phoneNumber')}</th>
                            <th>{t('joinedDate')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partners?.map((emp, index) => {
                            return <tr
                                className=" cursor_pointer hover"
                                onClick={() => nav('/employees/' + emp.id)}
                                key={emp.id}
                            >
                                <td>{index + 1}</td>
                                <td><img src={imageUrls[emp.email]} alt={t('user') + " " + t('image')} className='user_profile_img' /></td>
                                <td>{emp.name}</td>
                                <td>{emp.lastName}</td>
                                <td>{emp.phoneNumber}</td>
                                <td>{formatFirebaseDates(emp.joinedDate)}</td>

                            </tr>
                        })
                        }
                        {partners?.length == 0 && <tr>
                            <td colSpan={6}>{t('notExist')}</td>
                        </tr>}


                    </tbody>
                </table>
            </div>



        </div>
    )
}

export default Partners