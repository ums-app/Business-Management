import { t } from 'i18next';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function EmployeeCustomers({ data }) {
    const nav = useNavigate()
    const [customers, setcustomers] = useState();
    console.log(data);

    return (
        <div className='customers'>

            <h1 className='text_align_center margin_top_20'>{t('customers')}</h1>
            <table className="full_width custom_table table_row_hover">
                <thead >
                    <tr>
                        <th>{t('number')}</th>
                        <th>{t('name')}</th>
                        <th>{t('lastName')}</th>
                        <th>{t('name')} {t('organization')}</th>
                        <th>{t('phoneNumber')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.customers?.map((emp, index) => {
                        return <tr
                            className=" cursor_pointer hover"
                            onClick={() =>
                                nav('/employees/' + emp.id)
                            }
                        >
                            <td>{index + 1}</td>
                            <td>{emp.name}</td>
                            <td>{emp.lastName}</td>
                            <td>{emp.oraganization} </td>
                            <td>{emp.phoneNumber}</td>

                        </tr>
                    })
                    }


                </tbody>
            </table>
        </div>
    )
}

export default EmployeeCustomers