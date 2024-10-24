import React, { useEffect, useState } from 'react'
import { Representation } from '../../Types/Types'
import { getAllRepresentations } from '../../Utils/FirebaseTools'
import ShotLoadingTemplate from '../UI/LoadingTemplate/ShotLoadingTemplate'
import { t } from 'i18next'
import DisplayLogo from '../UI/DisplayLogo/DisplayLogo'
import { useNavigate } from 'react-router-dom'
import Button from '../UI/Button/Button'
import BtnTypes from '../../constants/BtnTypes'

const Representations = () => {
    const [representors, setRepresentors] = useState<Representation[]>([])
    const [loading, setloading] = useState<boolean>(true)
    const nav = useNavigate()

    useEffect(() => {
        getAllRepresentations()
            .then(res => setRepresentors(res))
            .finally(() => setloading(false));

    }, [])


    return (
        <div className='margin_top_20'>
            <Button
                text={`${t('add')} ${t('new')}`}
                btnType={BtnTypes.modern}
                onClick={() => nav('add')}
            />
            <div className='table_container margin_top_20 '>
                {loading ? <ShotLoadingTemplate /> :
                    <table className="full_width custom_table table_row_hover overflow_hidden">
                        <thead >
                            <tr><th colSpan={6}>{t('representations')}</th></tr>
                            <tr>
                                <th>#</th>
                                <th>{t('image')}</th>
                                <th>{t('name')}</th>
                                <th>{t('lastName')}</th>
                                <th>{t('location')}</th>
                                <th>{t('phoneNumber')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {representors?.map((emp, index) => {
                                return <tr
                                    className=" cursor_pointer hover"
                                    onClick={() => nav('/representations/' + emp.id)}
                                    key={emp.id}
                                >
                                    <td>{index + 1}</td>
                                    <td>
                                        {/* <DisplayLogo imgURL={imageUrls[emp.customer.email]} height='60px' width='60px' alt={t('user') + " " + t('image')} /> */}
                                    </td>
                                    <td>{emp.customer.name}</td>
                                    <td>{emp.customer.name}</td>
                                    <td>{emp.customer.location}</td>
                                    <td>{emp.customer.phoneNumber}</td>
                                </tr>
                            })
                            }
                            {representors?.length == 0 && <tr>
                                <td colSpan={6}>{t('notExist')}</td>
                            </tr>}
                        </tbody>
                    </table>
                }
            </div>
        </div>
    )
}

export default Representations