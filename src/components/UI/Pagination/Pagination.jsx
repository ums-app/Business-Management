import React, { useEffect, useState } from 'react'
import "./Pagination.css"
import Button from "../Button/Button"
import { t } from 'i18next'
import ICONS from '../../../constants/Icons'
import { useStateValue } from "../../../context/StateProvider"
import axiosClient from '../../../axios/axios'

function Pagination({ pageable = null, setData, nextPage, size = 20 }) {

    const [currentPage, setcurrentPage] = useState(0)
    const [lastPage, setlastPage] = useState(0)
    const [global, dispatch] = useStateValue()

    useEffect(() => {
        setcurrentPage(pageable?.number + 1)
        setlastPage(pageable?.totalPages)
    }, [pageable])


    const handleNextPage = () => {
        if (pageable.number + 1 >= pageable.totalPages) return;
        const apiEndpoint = nextPage();
        if (apiEndpoint == null) return;

        axiosClient.get(apiEndpoint(pageable?.number + 1, size))
            .then(res => {
                console.log(res)
                const data = res.data;
                setData(data)
                setcurrentPage(data?.number + 1)
                setlastPage(data?.totalPages)
            })
    }

    const handlePreviousPage = () => {
        if (currentPage == 1) return;
        const apiEndpoint = nextPage();
        if (apiEndpoint == null) return;
        axiosClient.get(apiEndpoint(pageable.number - 1, size))
            .then(res => {
                const data = res.data;
                setData(data)
                setcurrentPage(data?.number + 1)
                setlastPage(data?.totalPages)
            })
    }

    if (pageable == null) return null;


    return (
        <div className='display_flex align_items_center  width_max_content'>
            <Button icon={global.locale == "en" ? ICONS.chevronLeft : ICONS.chevronRight} onClick={handlePreviousPage} />
            <span className='margin_10'>{currentPage}</span>
            <span className='margin_10'>{t('of')}</span>
            <span className='margin_10'>{lastPage}</span>
            <Button icon={global.locale == "en" ? ICONS.chevronRight : ICONS.chevronLeft} onClick={handleNextPage} />
        </div>
    )
}

export default Pagination