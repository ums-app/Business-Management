import { t } from 'i18next';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../UI/Button/Button';
import { useStateValue } from '../../../context/StateProvider';
import "../Sales.css"
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker';
import { getUserImage } from '../../../Utils/FirebaseTools';
import DisplayLogo from '../../UI/DisplayLogo/DisplayLogo';
import ICONS from '../../../constants/Icons';
import { Timestamp, addDoc, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../../constants/FirebaseConfig';
import Collections from '../../../constants/Collections';
import { Tooltip } from 'react-tooltip';
import { gregorianToJalali, jalaliToGregorian } from 'shamsi-date-converter';
import { actionTypes } from '../../../context/reducer';
import { toast } from 'react-toastify';


export const productForSale = {
    prodcutId: '',
    name: "",
    englishName: "",
    total: "",
    pricePer: "",
    totalPrice: "",
};

function AddSaleFactor({ updateMode }) {
    const [{ authentication, customerForSaleFactor, factor }, dispatch] = useStateValue()
    const nav = useNavigate();
    const [customerImage, setcustomerImage] = useState();
    const productCollectionRef = collection(db, Collections.Products)
    const salesCollectionRef = collection(db, Collections.Sales);
    const [showAddNewPayment, setShowAddNewPayment] = useState(false);
    const [payment, setPayment] = useState({
        amount: 0,
        date: new Date(),
        by: authentication.email
    })

    const [customerFactor, setcustomerFactor] = useState({
        productsInFactor: [{ ...productForSale }],
        customer: customerForSaleFactor,
        payments: [],
        createdDate: new Date()
    })


    const [products, setProducts] = useState([]);

    useEffect(() => {
        const getImage = async () => {
            const url = await getUserImage(customerForSaleFactor.email);
            setcustomerImage(url)
        }
        getImage();
        getProducts();
        addNewProdcut()
        if (updateMode) {
            setcustomerFactor(factor)
        }
    }, [])


    const getProducts = async () => {
        const querySnapshot = await getDocs(productCollectionRef);
        const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setProducts(items);
        console.log(items);
    }

    const addNewProdcut = () => {
        const tempArr = [...customerFactor.productsInFactor];
        tempArr.push(productForSale);
        setcustomerFactor({
            ...customerFactor,
            productsInFactor: tempArr
        })
    }


    const handleSelectProduct = (e, index) => {
        const value = e.target.value
        const selectedProduct = products.find(item => item.id == value)
        console.log(selectedProduct);
        customerFactor.productsInFactor[index] = {
            prodcutId: selectedProduct.id,
            name: selectedProduct.name,
            englishName: selectedProduct.englishName,
            total: 1,
            pricePer: selectedProduct.price,
            totalPrice: selectedProduct.price,
        }
        setcustomerFactor({
            ...customerFactor,
            productsInFactor: [...customerFactor.productsInFactor]
        })
    }
    const handleChangeTotalProducts = (e, index) => {
        const pr = customerFactor.productsInFactor[index];

        pr.total = e.target.value;
        pr.totalPrice = Number(pr.total) * Number(pr.pricePer);

        customerFactor.productsInFactor[index] = pr;

        setcustomerFactor({
            ...customerFactor,
            productsInFactor: [...customerFactor.productsInFactor]
        })

    }

    const handleDeleteProduct = (index) => {
        const temp = [...customerFactor.productsInFactor];
        temp.splice(index, 1);
        setcustomerFactor({
            ...customerFactor,
            productsInFactor: temp
        })
    }
    const totalAll = () => {
        let totalAll = 0;
        customerFactor.productsInFactor.forEach(item => {
            totalAll += Number(item.totalPrice)
        })
        return totalAll;
    }
    const remainedAmount = () => {
        const total = totalAll();
        console.log('total : ', total);
        let paidAmount = 0;
        customerFactor.payments.forEach(item => {
            if (item.amount > 0)
                paidAmount += Number(item.amount)
        })
        console.log('paid : ', paidAmount);
        return total - paidAmount;
    }


    const savePaidAmount = () => {
        if (payment.amount > 0 && payment.date) {
            setcustomerFactor({
                ...customerFactor,
                payments: [...customerFactor.payments, { ...payment }]
            })
            setShowAddNewPayment(false)
        }

    }



    const deletePaidAmount = (index) => {
        const temp = [...customerFactor.payments];
        temp.splice(index, 1);
        setcustomerFactor({
            ...customerFactor,
            payments: temp
        })

    }

    const snedCustomerFactorToAPI = async () => {
        dispatch({
            type: actionTypes.SET_SMALL_LOADING,
            payload: true
        })
        try {
            if (updateMode) {
                const factorDoc = doc(db, Collections.Sales, factor.id)
                await updateDoc(factorDoc, customerFactor);
                toast.success(t('successfullyUpdated'))
                nav('/sales')
            } else {

                const customerRes = await addDoc(salesCollectionRef, { ...customerFactor })
                toast.success(t('successfullyAdded'));
                nav('/sales')
            }
        } catch (err) {
            toast.error(err)


        } finally {
            dispatch({
                type: actionTypes.SET_SMALL_LOADING,
                payload: false
            })
        }



    }

    if (!customerForSaleFactor) {
        nav(-1)
    }


    console.log(customerFactor);

    return (
        <div className='full_width'>
            <Button
                text={t('back')}
                onClick={() => nav(-1)}
            />
            <h1 className='title'>{updateMode ? t('update') : t('add')}  {t('factor')} {t('sale')}</h1>


            <div className='customer_information display_flex align_items_center justify_content_space_between margin_top_20 full_width'>
                <DisplayLogo imgURL={customerImage} />
                <div className='display_flex'>
                    <span className='bold'>{t('name')}:</span>
                    <span className='info_value'> {customerForSaleFactor?.name}</span>
                    <span className='bold'>{t('lastName')}:</span>
                    <span className='info_value'> {customerForSaleFactor?.lastName}</span>
                </div>

                <div className='display_flex align_items_center'>
                    <span className='bold'>{t('createdDate')}:</span>
                    <span className=''>
                        {<CustomDatePicker value={customerFactor.createdDate instanceof Timestamp ? customerFactor.createdDate.toDate() : new Date(customerFactor.createdDate)} onChange={e => {
                            const date = jalaliToGregorian(e.year, e.month.number, e.day)
                            const gDate = new Date();
                            gDate.setFullYear(date[0])
                            gDate.setMonth(date[1])
                            gDate.setDate(date[2]);
                            setcustomerFactor({
                                ...customerFactor,
                                createdDate: gDate
                            })
                        }} />}
                    </span>
                </div>
            </div>

            <table className='custom_table full_width margin_bottom_10'>
                <thead>
                    <tr>
                        <th>{t('number')}</th>
                        <th>{t('name')} {t('product')}</th>
                        <th>{t('englishName')}</th>
                        <th>{t('total')}</th>
                        <th>{t('pricePer')}</th>
                        <th>{t('totalPrice')}</th>
                        <th>{t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {customerFactor?.productsInFactor.map((prInFactor, index) => {
                        return (
                            <tr>
                                <td>{index + 1}</td>
                                <td>
                                    <select name="products" id="" onChange={(e) => handleSelectProduct(e, index)}>
                                        <option value={null}>
                                            {t("chooseTheProduct")}
                                        </option>
                                        {products.map(pr => {
                                            return (
                                                <option value={pr.id} key={pr.id} selected={prInFactor.prodcutId == pr.id} style={{ width: 'max-content' }}>
                                                    {pr.name}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </td>
                                <td>{prInFactor.englishName}</td>
                                <td><input type="number" value={prInFactor.total} onChange={e => handleChangeTotalProducts(e, index)} /></td>
                                <td>{prInFactor.pricePer}</td>
                                <td>{prInFactor.totalPrice}</td>
                                <td>
                                    <Button
                                        icon={ICONS.trash}
                                        onClick={() => handleDeleteProduct(index)}
                                        type={'crossBtn'}
                                        id={'delete_row'}
                                    />
                                    <Tooltip
                                        anchorSelect="#delete_row"
                                        place="right"
                                        className="toolTip_style"
                                    >
                                        {t("delete")}
                                    </Tooltip>
                                </td>
                            </tr>
                        )
                    })}

                    <Button
                        icon={ICONS.plus}
                        onClick={addNewProdcut}
                        type={'plusBtn'}
                        id={'add_new_row'}
                    />
                    <Tooltip
                        anchorSelect="#add_new_row"
                        place="left"
                        className="toolTip_style"
                    >
                        {t("add")}
                    </Tooltip>

                </tbody>
            </table>

            <div className='full_width margin_top_20 padding_top_10 display_flex justify_content_end flex_direction_column align_items_start input'>
                <h1 className='text_align_center margin_top_10 full_width'>{t('payments')}</h1>
                <div className='margin_top_10 margin_bottom_10'>
                    <span className=''>{t('totalAll')}: </span>
                    <span className='info_value'>{totalAll()}</span>
                </div>
                <div>
                    {customerFactor.payments.map((payment, index) => {
                        console.log(payment.date);
                        let date = payment.date;
                        // Check if date is a timestamp (number), and convert it to a Date object if so
                        if (date instanceof Timestamp) {
                            date = date.toDate();
                        } else if (typeof date === 'string') {
                            // Convert the string date to a Date object (assuming it's a valid string date format)
                            date = new Date(date);
                        }
                        // Now, pass the date to gregorianToJalali after ensuring it's a Date object
                        const jalaliDate = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate()).join('/');

                        return (
                            <div className='margin_top_10 margin_bottom_10 border_1px_solid padding_10'>
                                <span className='info_value'>{index + 1}: </span>
                                <span className=''>{t('paidAmount')}: </span>
                                <span className='info_value'>{payment.amount} </span>
                                <span className=''>{t('date')}: </span>
                                <span className='info_value short_date'>{jalaliDate} </span>
                                <span>
                                    <Button
                                        text={t('delete')}
                                        type={'plusBtn'}
                                        id={'delete_payment'}
                                        onClick={() => deletePaidAmount(index)}
                                    />
                                </span>
                            </div>

                        )
                    })}
                    {showAddNewPayment &&
                        <div className='margin_top_10 margin_bottom_10 border_1px_solid padding_10'>
                            <span className='info_value'>{t('paidAmount')}: </span>
                            <span className='info_value'>
                                <input type="number" onChange={e => setPayment({ ...payment, amount: e.target.value })} />
                            </span>
                            <span className='info_value'>{t('date')}: </span>
                            <span className='info_value short_date'>
                                <CustomDatePicker onChange={e => {
                                    const date = jalaliToGregorian(e.year, e.month.number, e.day)
                                    const gDate = new Date();
                                    gDate.setFullYear(date[0])
                                    gDate.setMonth(date[1])
                                    gDate.setDate(date[2]);
                                    setPayment({
                                        ...payment,
                                        date: gDate
                                    })
                                }} />
                            </span>
                            <span>
                                <Button
                                    text={t('save')}
                                    type={'plusBtn'}
                                    id={'add_new_payment'}
                                    onClick={() => savePaidAmount()}
                                />
                                <Button
                                    text={t('cancel')}
                                    type={'crossBtn'}
                                    id={'cancel_new_payment'}
                                    onClick={() => setShowAddNewPayment(false)}
                                />
                            </span>
                        </div>
                    }
                    {
                        remainedAmount() > 0 &&
                        <Button
                            icon={ICONS.plus}
                            type={'plusBtn'}
                            id={'add_new_payment'}
                            onClick={() => setShowAddNewPayment(true)}
                        />
                    }
                    <Tooltip
                        anchorSelect="#add_new_payment"
                        place="left"
                        className="toolTip_style"
                    >
                        {t("add")}
                    </Tooltip>

                </div>
                <div className='margin_top_10 margin_bottom_10'>
                    <span className=''>{t('remainedAmount')}: </span>
                    <span className='info_value'>{remainedAmount()}</span>
                </div>

            </div>
            <div className='margin_top_20 margin_bottom_10 display_flex justify_content_center'>
                <Button
                    text={t('save')}
                    type={'plusBtn'}
                    id={'save_customer_factor'}
                    onClick={snedCustomerFactorToAPI}
                />
            </div>
        </div>
    )
}

export default AddSaleFactor