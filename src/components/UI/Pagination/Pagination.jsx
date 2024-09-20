import React, { useEffect, useState } from 'react'
import "./Pagination.css"
import Button from "../Button/Button"
import { t } from 'i18next'
import ICONS from '../../../constants/Icons'
import { useStateValue } from "../../../context/StateProvider"
import { Tooltip } from 'react-tooltip'


function Pagination({ nextPage, prevPage, total, currentPage, isPrevPageAvailable }) {


    const [global, dispatch] = useStateValue()


    return (
        <div className='display_flex align_items_center  width_max_content'>
            <Button
                icon={global.locale == "en" ? ICONS.chevronLeft : ICONS.chevronRight}
                onClick={prevPage}
                id={'prevPage'}
            />
            <Tooltip
                anchorSelect="#prevPage"
                place="top"
                className="toolTip_style"
            >
                {t("page")} {t("prev")}
            </Tooltip>
            <span className='margin_10'>{currentPage}</span>
            <span className='margin_10'>{t('of')}</span>
            <span className='margin_10'>{total}</span>
            <Button icon={global.locale == "en" ? ICONS.chevronRight : ICONS.chevronLeft} onClick={nextPage} id={'nextPage'} />
            <Tooltip
                anchorSelect="#nextPage"
                place="top"
                className="toolTip_style"
            >
                {t("page")} {t("next")}
            </Tooltip>
        </div>
    )
}

export default Pagination