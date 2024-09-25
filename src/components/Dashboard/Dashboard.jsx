import { t } from 'i18next'
import React from 'react'

function Dashboard() {
    return (
        <div>

            <div className='input margin_top_20 border_radius_8'>
                <p className='title_2 bold'>{t('statistics')}</p>
                <div className='display_flex justify_content_center align_items_center flex_flow_wrap'>
                    <div className='display_flex flex_direction_column align_items_center margin_10 padding_10 border_radius_6 border_1px_solid '>
                        <span>{t('total')} {t('employees')}</span>
                        <span>{10}</span>
                    </div>
                    <div className='display_flex flex_direction_column align_items_center margin_10 padding_10 border_radius_6 border_1px_solid '>
                        <span>{t('total')} {t('customers')}</span>
                        <span>{10}</span>
                    </div>
                    <div className='display_flex flex_direction_column align_items_center margin_10 padding_10 border_radius_6 border_1px_solid '>
                        <span>{t('total')} {t('products')}</span>
                        <span>{10}</span>
                    </div>



                </div>

            </div>

        </div>
    )
}

export default Dashboard