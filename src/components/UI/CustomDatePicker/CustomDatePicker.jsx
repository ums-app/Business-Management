import { t } from 'i18next';
import React from 'react'
import { DatePicker } from "zaman";

function CustomDatePicker({ defaultValue = new Date(), position = "center", className, value, onChange, label = t('date') }) {
    return (
        <div className="build_box">
            <label htmlFor={'endDate'}>{label}</label>
            <DatePicker
                name={'endDate'}
                id={'endDate'}
                required
                defaultValue={defaultValue}
                onChange={onChange}
                position={position}
                className={`form-control persian_date ${className}`}
            />
        </div>

    )
}

export default CustomDatePicker