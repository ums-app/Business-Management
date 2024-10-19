import { addDoc, collection, doc, Timestamp } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Partner } from '../../../Types/Types'
import { useStateValue } from '../../../context/StateProvider'
import { ConsumptionsType } from '../../../constants/Others'
import { t } from 'i18next'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import Button from '../../UI/Button/Button'
import { useNavigate } from 'react-router-dom'
import * as yup from "yup";
import { toast } from 'react-toastify'
import { jalaliToGregorian } from 'shamsi-date-converter'
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker'
import { getPartners } from '../../../Utils/FirebaseTools'
import { isGcsTfliteModelOptions } from 'firebase-admin/lib/machine-learning/machine-learning-api-client'
import { db } from '../../../constants/FirebaseConfig'
import Collections from '../../../constants/Collections'

export interface Consumption {
    id: string,
    createdDate: Timestamp | Date,
    amount: number,
    type: string,
    date: Timestamp | Date,
    to: Partner | null,
    descriptions: string,
    registrar: string,
}


const AddConsumptions: React.FC = () => {
    const nav = useNavigate();
    const [{ authentication },] = useStateValue();
    const [consumption, setconsumption] = useState<Consumption>({
        id: '',
        amount: 0,
        createdDate: new Date(),
        date: new Date(),
        descriptions: '',
        registrar: `${authentication.name} ${authentication.lastname}`,
        to: null,
        type: ''
    })
    const [loading, setloading] = useState(false)
    const [partners, setpartners] = useState<Partner[]>([]);
    const consumptionCollectionRef = collection(db, Collections.Consumptions);

    useEffect(() => {
        getPartners().then(res => {
            setpartners(res)
        })
    }, [])


    const sendDataToAPI = async () => {
        if (consumption.type.length == 0 || consumption.amount == 0 || (consumption.type == ConsumptionsType.WITHDRAW && !consumption.to)) {
            toast.error('pleaseFillTheForm');
            return;
        }

        try {
            addDoc(consumptionCollectionRef, consumption)
            toast.success('successfullyAdded')
            nav(-1)
        } catch (err) {
            console.log(err);

        }

        console.log(consumption);
    }


    const handleFormChanges = (e) => {
        const name = e.target.name;
        let value = e.target.value;

        if (name == 'to') {
            value = partners.find(item => item.id == value)
        }


        const temp = { ...consumption };
        temp[name] = value;
        setconsumption(temp)
    }

    console.log(consumption);


    return (
        <div>
            <div className='add_product'>
                <Button
                    text={t('back')}
                    onClick={() => nav(-1)}
                    btnType={" margin_bottom_10"}
                />
                <Formik
                    initialValues={consumption}
                    validationSchema={Schema}
                    // onSubmit={sendDataToAPI}
                    enableReinitialize={true}
                >
                    <Form
                        className="add_form display_flex flex_direction_column"
                        onChange={handleFormChanges}
                    >
                        <div className="full_width margin_top_10 display_flex flex_direction_column">
                            <div className="form_inputs margin_top_20  " >
                                <div className='display_flex flex_direction_column margin_5'>
                                    <label htmlFor="visitorContractType">{t('type')}</label>
                                    <Field
                                        name="type"
                                        type="number"
                                        as='select'
                                        className="input"
                                    // onChange={e => console.log(e.target.value)}

                                    >
                                        <option value={''}></option>
                                        <option value={ConsumptionsType.RETAIL_CONSUMPTION}>{t('retailConsumptions')}</option>
                                        <option value={ConsumptionsType.CONSTANT_CONSUMPTION}>{t('constantConsumptions')}</option>
                                        <option value={ConsumptionsType.MAJOR_CONSUMPTION}>{t('majorConsumptions')}</option>
                                        <option value={ConsumptionsType.WITHDRAW}>{t('withdraw')}</option>
                                    </Field>
                                    <ErrorMessage
                                        name="type"
                                        component="div"
                                        className="error_msg"
                                    />
                                </div>
                                <div className='display_flex flex_direction_column margin_5'>
                                    <label htmlFor="amount">{t('amount')}</label>
                                    <Field
                                        name="amount"
                                        type="number"
                                        className="input"
                                    />
                                    <ErrorMessage
                                        name="amount"
                                        component="div"
                                        className="error_msg"
                                    />
                                </div>

                                <div className='display_flex flex_direction_column margin_5' style={{ direction: "rtl" }}>
                                    <label htmlFor="date">{t('date')}</label>
                                    <CustomDatePicker
                                        name={'joinedDate'}
                                        value={consumption?.date instanceof Timestamp ?
                                            consumption?.date?.toDate()
                                            : new Date(consumption?.date)}
                                        onChange={e => {
                                            const dateArray = jalaliToGregorian(e.year, e.month.number, e.day);

                                            // Ensure leading zeros for month and day
                                            const year = dateArray[0];
                                            const month = String(dateArray[1]).padStart(2, '0');
                                            const day = String(dateArray[2]).padStart(2, '0');

                                            // ISO format: YYYY-MM-DD
                                            const dateString = `${year}-${month}-${day}T00:00:00Z`;
                                            const date = new Date(dateString);

                                            console.log("Converted Date:", date); // Log for debugging

                                            // Validate the date
                                            if (isNaN(date.getTime())) {
                                                console.error("Invalid Date after conversion:", date);
                                                toast.error(t('Invalid Date Detected'));
                                                return;
                                            }
                                            console.log(date);

                                            // If the date is valid, store it in the Firebase Timestamp
                                            setconsumption({
                                                ...consumption,
                                                date: Timestamp.fromDate(date) // Ensure it's in the correct format
                                            });
                                        }}
                                    />
                                    <ErrorMessage
                                        name="joinedDate"
                                        component="div"
                                        className="error_msg"
                                    />
                                </div>
                                {consumption.type == ConsumptionsType.WITHDRAW &&
                                    <div className='display_flex flex_direction_column margin_5'>
                                        <label htmlFor="to">{t('toAccount')}</label>
                                        <Field
                                            name="to"
                                            type="number"
                                            as='select'
                                            className="input"
                                        >
                                            <option value={''}></option>
                                            {partners.map(partner => {
                                                return <option value={partner.id}>{partner.name} {partner.lastName}</option>
                                            })}

                                        </Field>
                                        <ErrorMessage
                                            name="type"
                                            component="div"
                                            className="error_msg"
                                        />
                                    </div>
                                }
                                <div className='display_flex flex_direction_column margin_5'>
                                    <label htmlFor="descriptions">{t('descriptions')}</label>
                                    <Field
                                        name="descriptions"
                                        as="textarea"
                                        type="text"
                                        className="input"
                                        autoFocus
                                    />
                                    <ErrorMessage
                                        name="name"
                                        component="div"
                                        className="error_msg"
                                    />
                                </div>

                            </div>

                        </div>
                        <div className=' margin_top_10 margin_left_10 margin_right_10'>
                            <Button
                                text={t('save')}
                                // type={'submit'}
                                loading={loading}
                                onClick={sendDataToAPI}
                            />
                        </div>
                    </Form>
                </Formik>

            </div >




        </div >
    )
}

export default AddConsumptions

// Define the validation schema using Yup
const Schema = yup.object().shape({
    type: yup
        .string()
        .min(2, `${t("type")} ${t("isShortText")}`)
        .max(40, `${t("type")} ${t("isLongText")}`)
        .required(`${t("type")} ${t("isRequireText")}`),
    descriptions: yup
        .string()
        .min(3, `${t("descriptions")} ${t("isShortText")}`)
        .max(300, `${t("descriptions")} ${t("isLongText")}`)
        .required(`${t("descriptions")} ${t("isRequireText")}`),
    date: yup
        .date()
        .required(`${t("descriptions")} ${t("isRequireText")}`),
    amount: yup
        .number()
        .required(`${t("amount")} ${t("isRequireText")}`),


});
