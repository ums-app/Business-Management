import React, { useState } from 'react'
import Button from "../../UI/Button/Button"
import { t } from 'i18next'
import Modal from "../../UI/modal/Modal"

function Sections() {
    const [addFormModal, setaddFormModal] = useState()
    const [formData, setformData] = useState({
        name: "",

    })

    const sendDataToAPI = () => {

    }
    return (
        <div className='display_flex'>
            <Button
                text={t('add') + " " + t('section')}
                onClick={() => setaddFormModal(true)}
            />

            <Modal
                modalClose={() => setaddFormModal(false)}
                show={addFormModal}>

                <div className='display_flex flex_direction_column'>
                    <h1 className='title_2'>{t('add')} {t('section')}</h1>
                    <div className='display_flex flex_direction_column'>
                        <label htmlFor="name" className='margin_left_10 margin_right_10 '>
                            {t('name')}*
                        </label>
                        <input type="text" name='name' onChange={e => setformData({
                            ...formData,
                            name: e.target.value
                        })} />
                    </div>
                    <div className=' margin_top_10 margin_left_10 margin_right_10'>
                        <Button
                            text={t('save')}
                            onClick={sendDataToAPI}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default Sections