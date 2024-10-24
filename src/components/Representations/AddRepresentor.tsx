import React, { useEffect, useState } from 'react'
import Button from '../UI/Button/Button'
import { useNavigate, useParams } from 'react-router-dom'
import { t } from 'i18next'
import { CustomerForSaleFactor, Log, Representation, UpdateModeProps } from '../../Types/Types'
import { Tooltip } from 'react-tooltip'
import { addDoc, collection, doc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore'
import Collections from '../../constants/Collections'
import { db } from '../../constants/FirebaseConfig'
import { mapDocToCustomer } from '../../Utils/Mapper'
import { getCustomersByCustomerById, getRepresentorById, getUserImage, sendLog } from '../../Utils/FirebaseTools'
import DisplayLogo from '../UI/DisplayLogo/DisplayLogo'
import ShotLoadingTemplate from '../UI/LoadingTemplate/ShotLoadingTemplate'
import { formatFirebaseDates } from '../../Utils/DateTimeUtils'
import { CurrencyType } from '../../constants/Others'
import { toast } from 'react-toastify'
import { jalaliToGregorian } from 'shamsi-date-converter'
import CustomDatePicker from '../UI/DatePicker/CustomDatePicker'
import { useStateValue } from '../../context/StateProvider'
import LoadingTemplateContainer from '../UI/LoadingTemplate/LoadingTemplateContainer'


interface Suggestion {
    name: string,
    lastName: string,
    id: string,
    customerType: string
}

const AddRepresentor: React.FC<UpdateModeProps> = ({ updateMode = false }) => {
    const { representorId } = useParams();
    const [{ authentication }, dispatch] = useStateValue()
    const nav = useNavigate()
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [inputValue, setInputValue] = useState('');
    const [searchValue, setsearchValue] = useState('')
    const [loading, setloading] = useState<boolean>(false)
    const [customer, setCustomer] = useState<CustomerForSaleFactor>();
    const [customerImg, setcustomerImg] = useState<string>();
    const [customerLoading, setcustomerLoading] = useState<boolean>(false)
    const [representor, setRepresentor] = useState<Representation>({
        amountOfLoan: 0,
        createdDate: new Date(),
        currencyType: CurrencyType.USD,
        customer: customer,
        id: ''
    })
    const representationCollectionRef = collection(db, Collections.Representations);

    useEffect(() => {
        const debouncedSearch = debounce(handleInputChange, 300);
        return () => {
            debouncedSearch.cancel();
        };
    }, [inputValue]);


    useEffect(() => {
        if (updateMode && representorId) {
            getRepresentorById(representorId)
                .then(res => {
                    setRepresentor(res);
                    setCustomer(res.customer);
                    getUserImage(res.customer.email)
                        .then(url => setcustomerImg(url))
                })
        }

    }, [representorId])



    const debounce = (func, delay) => {
        let timeoutId;
        const debounced = (...args) => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };

        debounced.cancel = () => {
            if (timeoutId) clearTimeout(timeoutId);
        };

        return debounced;
    };



    // Handler for input change
    const handleInputChange = async (e) => {

        const value = e.target.value;
        setsearchValue(value)
        setInputValue(value);

        if (value.trim().length === 0) {
            setSuggestions([]);
            return;
        }

        console.log(value);

        // Firestore query to search by name or lastname
        const q = query(
            collection(db, Collections.Customers),
            where('name', '>=', value),
            where('name', '<=', value + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);
        const fetchedSuggestions: Suggestion[] = [];

        querySnapshot.forEach((doc) => {
            const customerData = doc.data();
            console.log(customerData);
            fetchedSuggestions.push({ name: customerData.name, lastName: customerData.lastName, customerType: customerData.customerType, id: doc.id })
        });


        console.log(fetchedSuggestions);

        setSuggestions(fetchedSuggestions);
    };

    const findCustomerById = async (id: string) => {
        setcustomerLoading(true)
        getCustomersByCustomerById(id)
            .then(res => {
                setCustomer(res)
                getUserImage(res.email)
                    .then(url => setcustomerImg(url))
            })
            .finally(() => setcustomerLoading(false))
        setSuggestions([]);
    };


    const sendDataToTheAPI = async () => {
        setloading(true)
        // do some check
        if (!customer) {
            toast.error(t('selectCustomerError'))
            return
        }
        // do some check
        if (representor.amountOfLoan <= 0) {
            toast.error(t('enterAmountOfLoan'))
            return
        }

        // chech i wether its updaremode or not
        try {

            if (updateMode) {
                const repRef = doc(db, Collections.Representations, representorId)
                await updateDoc(repRef, { ...representor, customer: customer });

                const log: Log = {
                    createdDate: new Date(),
                    registrar: `${authentication.name} ${authentication.lastname}`, // Assume you have a way to track the current user
                    title: `${t('update')} ${t('representor')}`,
                    message: `${t('representor')} [${customer.name} ${customer.lastName}] ${t('successfullyUpdated')}`,
                    data: { ...representor, id: representor, customer: customer }
                };
                await sendLog(log);
                toast.success(t('successfullyUpdated'))
                nav('/representations/' + representorId)

            } else {
                // try add new data to server

                const customerRes = await addDoc(representationCollectionRef, { ...representor, customer: customer })


                const log = {
                    createdDate: new Date(),
                    registrar: `${authentication.name} ${authentication.lastname}`, // Assume you have a way to track the current user
                    title: `${t('add')} ${t('customer')}`,
                    message: `${t('representor')} [${customer.name} ${customer.lastName}] ${t('successfullyAdded')}`,
                    data: { ...representor, id: customerRes.id, customer: customer }
                };
                await sendLog(log);

                toast.success(t('successfullyAdded'))
                nav('/representations')
            }
        } catch (err) {
            console.log(err);

        } finally {
            setloading(false)
        }

    }



    if (updateMode && !representor.customer) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }



    return (
        <div>
            <h2 className='title'>{t('add')} {t('representation')}</h2>
            <Button
                onClick={() => nav(-1)}
                text={t('back')}
            />

            <div className='input full_width margin_top_20'>
                <div className='search_bar'>
                    <div className='position_relative full_width'>
                        <label htmlFor="searchBoxValue" >{t('selectCustomer')}: </label>
                        <input type="text"
                            placeholder={t('addCustomerName')}
                            value={inputValue} onChange={handleInputChange}
                            id='searchBoxSelect'
                            className='full_width margin_top_5'
                            autoComplete="off"
                        />
                        {suggestions.length > 0 && (
                            <ul className='suggestion_box'>
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        className='cursor_pointer'
                                        key={index}
                                        onClick={() => findCustomerById(suggestion.id)}><span>{suggestion.name}</span>  <span>{suggestion.lastName}</span>  <span>{t(suggestion.customerType)} </span></li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <Tooltip
                        anchorSelect="#searchBoxSelect"
                        place="top"
                        className="toolTip_style"
                    >
                        {t("enterValueForSearching")}
                    </Tooltip>
                    {/* <Button text={t('search')} icon={ICONS.search} onClick={getDocsBySearchValue} /> */}
                </div>

            </div>

            {customer &&
                <div className='input margin_top_10 display_flex flex_direction_column'>
                    <p className='title_2s'>{t('details')} {t('customer')}</p>
                    {customerLoading ? <ShotLoadingTemplate /> :
                        <>
                            <DisplayLogo imgURL={customerImg} alt={'img'} />
                            <div className='display_flex justify_content_center full_width'>

                                <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                                    <span >{t('name')} </span>
                                    <span>{customer?.name}</span>
                                </div>
                                <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                                    <span>{t('lastName')} </span>
                                    <span>{customer?.lastName}</span>
                                </div>
                                <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                                    <span>{t('location')} </span>
                                    <span>{customer?.location}</span>
                                </div>
                                <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                                    <span>{t('phoneNumber')} </span>
                                    <span>{customer?.phoneNumber}</span>
                                </div>
                                <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                                    <span>{t('customerType')} </span>
                                    <span>{t(customer?.customerType)}</span>
                                </div>
                                <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                                    <span>{t('createdDate')} </span>
                                    <span>{customer?.createdDate && formatFirebaseDates(customer.createdDate)}</span>
                                </div>
                                <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                                    <span>{t('joinedDate')} </span>
                                    <span>{customer?.joinedDate && formatFirebaseDates(customer.joinedDate)}</span>
                                </div>
                            </div>
                        </>
                    }
                </div>
            }

            <div className='input margin_top_10 display_flex margin_bottom_10'>
                <div className='display_flex flex_direction_column margin_left_10 margin_right_10'>
                    <label htmlFor="amountOfLoan">{t('amountOfLoan')}</label>
                    <input type="number" name='amountOfLoan'
                        value={representor.amountOfLoan}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setRepresentor({
                                ...representor,
                                amountOfLoan: Number(e.target.value)
                            })
                        }} />
                </div>
                <div className='display_flex flex_direction_column margin_left_10 margin_right_10'>
                    <label htmlFor="currencyType">{t('currencyType')}</label>
                    <select name="currencyType" id="" defaultValue={representor.currencyType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setRepresentor({
                                ...representor,
                                currencyType: e.target.value
                            })
                        }}
                    >
                        <option value={undefined} disabled>{t('currencyType')}</option>
                        {Object.keys(CurrencyType).map(key => {
                            return <option value={key} key={key}>{t(key)}</option>
                        })}
                    </select>
                </div>
                <div className='display_flex flex_direction_column margin_left_10 margin_right_10' style={{ direction: "rtl" }}>
                    <label htmlFor="createdDate">{t('createdDate')}</label>
                    <CustomDatePicker
                        value={representor?.createdDate instanceof Timestamp ?
                            representor?.createdDate?.toDate()
                            : new Date(representor?.createdDate)}
                        name={'createdDate'}
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

                            // If the date is valid, store it in the Firebase Timestamp
                            setRepresentor({
                                ...representor,
                                createdDate: Timestamp.fromDate(date) // Ensure it's in the correct format
                            });
                        }}
                    />
                </div>
            </div>
            <Button
                text={t('save')}
                onClick={sendDataToTheAPI}
                loading={loading}
            />





        </div>
    )
}

export default AddRepresentor