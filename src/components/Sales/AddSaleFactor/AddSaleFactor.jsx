import { t } from 'i18next';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../UI/Button/Button';
import { useStateValue } from '../../../context/StateProvider';
import "../Sales.css"
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker';
import { getEmployeeById, getUserImage } from '../../../Utils/FirebaseTools';
import DisplayLogo from '../../UI/DisplayLogo/DisplayLogo';
import ICONS from '../../../constants/Icons';
import { Timestamp, addDoc, collection, deleteDoc, doc, getCountFromServer, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from '../../../constants/FirebaseConfig';
import Collections from '../../../constants/Collections';
import { Tooltip } from 'react-tooltip';
import { jalaliToGregorian } from 'shamsi-date-converter';
import { actionTypes } from '../../../context/reducer';
import { toast } from 'react-toastify';
import FactorForPrint from '../FactorForPrint/FactorForPrint';
import Modal from '../../UI/modal/Modal';
import Menu from "../../UI/Menu/Menu"
import { FactorType, factorStatus } from '../../../constants/FactorStatus';
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils';
import MoneyStatus from '../../UI/MoneyStatus/MoneyStatus';

export const productForSale = {
    productId: '',
    name: "",
    englishName: "",
    total: "",
    pricePer: "",
    discount: {
        value: 0,
        type: 'percent'
    },
    totalPrice: "",
};

function AddSaleFactor({ updateMode }) {
    const [{ authentication, customerForSaleFactor, factor }, dispatch] = useStateValue()
    const nav = useNavigate();
    const [showPrintModal, setshowPrintModal] = useState(false);
    const [customerImage, setcustomerImage] = useState();
    const [customerFactors, setCustomeractors] = useState([]);
    const [customerPayments, setCustomerPayments] = useState([]);
    const productCollectionRef = collection(db, Collections.Products)
    const salesCollectionRef = collection(db, Collections.Sales);
    const paymentCollectionRef = collection(db, Collections.Payments);
    const [allCustomerPayments, setAllCustomerPayments] = useState([]);
    const [totalAmountOfCustomerPayments, settotalAmountOfCustomerPayments] = useState(0)
    const [totalAmountOfCustomerFactors, settotalAmountOfCustomerFactors] = useState(0)
    const [products, setProducts] = useState([]);
    const [saved, setsaved] = useState(false)

    // this is for tracking all user payments
    const [userPayment, setUserPayment] = useState({
        amount: 0,
        createdDate: new Date(),
        by: authentication.email,
        saleId: factor?.id,
        customerId: customerForSaleFactor?.id,
        date: new Date()
    })

    const [showAddNewPayment, setShowAddNewPayment] = useState(false);
    const [customerFactor, setcustomerFactor] = useState({
        productsInFactor: [{ ...productForSale }],
        customer: customerForSaleFactor,
        payments: [],
        createdDate: new Date(),
        indexNumber: 0,
        type: FactorType.STANDARD_FACTOR,
        by: authentication.email
    })

    useEffect(() => {
        settotalAmountOfCustomerPayments(totalAmountOfAllCustomerPayments());
        settotalAmountOfCustomerFactors(totalAmountOfAllFactors());
    }, [allCustomerPayments])


    useEffect(() => {
        const getImage = async () => {
            const url = await getUserImage(customerForSaleFactor.email);
            setcustomerImage(url)
        }
        const getTotalNumberOfFactors = async () => {
            const snapshot = await getCountFromServer(salesCollectionRef);
            const totalDocs = snapshot.data().count;
            setcustomerFactor({
                ...customerFactor,
                indexNumber: Number(totalDocs) + 1001
            })
        }

        console.log(factor);

        if (!updateMode) {
            getTotalNumberOfFactors();
        }
        getCustomerFactors();
        getAllCustomerPayments()
        getImage();
        getProducts();
        addNewProdcut()
        if (updateMode) {
            setcustomerFactor(factor)
        }

    }, [])


    useEffect(() => {
        console.log('get emp :', customerForSaleFactor);
        if (customerForSaleFactor) {
            console.log('in if: ', customerForSaleFactor);
            getEmployeeById(customerForSaleFactor.visitor)
                .then(res => {
                    console.log(res);
                })
        }
    }, [customerForSaleFactor])

    const getCustomerFactors = async () => {
        console.log('get all incomplete fac func: ', 'customerId: ', customerForSaleFactor.id, 'status: ', factorStatus.INCOMPLETE);

        const q = query(
            salesCollectionRef,
            where("customer.id", "==", customerForSaleFactor.id),
        );

        try {
            const querySnapshot = await getDocs(q);
            console.log('querysnapshot is empty: ', querySnapshot.empty);
            // First map to an array, then filter and sort
            let items = querySnapshot.docs
                .map(doc => ({ ...doc.data(), id: doc.id })) // Map to data with id
                .sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()); // Sort by date

            console.log(factor);
            if (updateMode) {
                items = items.filter(doc => doc.id !== factor?.id);
            }
            // Try to set all the amount in a container
            setCustomeractors(items);

        } catch (error) {
            console.error("Error getting documents: ", error);
        }
    };






    const getAllCustomerPayments = async () => {
        const q = query(
            paymentCollectionRef,
            where("customerId", "==", customerForSaleFactor.id),
        );

        try {
            const querySnapshot = await getDocs(q);
            console.log('querysnapshot is empty: ', querySnapshot.empty);
            // First map to an array, then filter and sort
            let items = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) // Map to data with id

            // Try to set all the amount in a container
            setAllCustomerPayments(items);

            // if this is update mode then extract the payment of this factor into sperate list
            if (updateMode) {
                const paymentOfThisFactor = items.filter(item => item.saleId == factor?.id);
                if (paymentOfThisFactor.length > 0)
                    setUserPayment(paymentOfThisFactor[0]);
            }

        } catch (error) {
            console.error("Error getting documents: ", error);
        }
    };

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
            productId: selectedProduct.id,
            name: selectedProduct.name,
            englishName: selectedProduct.englishName,
            total: 1,
            discount: {
                value: 0,
                type: 'percent'
            },
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
        pr.totalPrice = caculateTotalPriceOfProduct(pr);

        customerFactor.productsInFactor[index] = pr;

        setcustomerFactor({
            ...customerFactor,
            productsInFactor: [...customerFactor.productsInFactor]
        })
    }

    const handleChangeProductPrice = (e, index) => {
        const pr = customerFactor.productsInFactor[index];

        pr.pricePer = e.target.value;
        pr.totalPrice = caculateTotalPriceOfProduct(pr);

        customerFactor.productsInFactor[index] = pr;
        setcustomerFactor({
            ...customerFactor,
            productsInFactor: [...customerFactor.productsInFactor]
        })

    }

    const handleChangeProductDiscount = (e, index) => {
        const pr = customerFactor.productsInFactor[index];

        console.log(e.target.value);
        pr.discount.value = Number(e.target.value);
        pr.totalPrice = caculateTotalPriceOfProduct(pr);
        customerFactor.productsInFactor[index] = pr;
        setcustomerFactor({
            ...customerFactor,
            productsInFactor: [...customerFactor.productsInFactor]
        })
    }

    const handleChangeProductDiscountType = (e, index) => {
        const pr = customerFactor.productsInFactor[index];
        pr.discount.type = e.target.value;
        pr.totalPrice = caculateTotalPriceOfProduct(pr);

        customerFactor.productsInFactor[index] = pr;
        setcustomerFactor({
            ...customerFactor,
            productsInFactor: [...customerFactor.productsInFactor]
        })
        console.log(pr);
    }

    const caculateTotalPriceOfProduct = (product) => {
        let discount = product.discount.value;
        if (product.discount.type == 'percent') {
            discount = (discount * product.pricePer) / 100;
        }
        console.log(product.discount);
        console.log(discount);

        return product.total * (product.pricePer - discount);
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
        customerFactor?.productsInFactor?.forEach(item => {
            totalAll += Number(item.totalPrice)
        })
        return totalAll;
    }

    // this func is going to calculate the remained value of this factor
    const remainedAmount = () => {
        const total = totalAll();
        return total - Number(userPayment.amount + '')
        // return remained < 0 ? 0 : remained;
    }

    // this func is going to calculate the remained value of previous factors
    const totalAmountOfAllFactors = () => {
        // check if incomplete factors are fetched
        if (!customerFactors) {
            getCustomerFactors();
        }
        let totalRemainedOfAllFactor = 0;
        customerFactors?.filter(item => item.createdDate < customerFactor.createdDate)
            .forEach(fac => {
                console.log((fac));
                totalRemainedOfAllFactor += getTotalPriceOfFactor(fac);
            })
        return totalRemainedOfAllFactor;
    }


    // this func is going to calculate the remained value of previous factors
    const totalAmountOfAllCustomerPayments = () => {
        // check if incomplete factors are fetched
        if (!allCustomerPayments) {
            getAllCustomerPayments();
        }
        let totalAmountOfAllPayments = 0;
        allCustomerPayments
            .filter(item => item.createdDate < customerFactor.createdDate)
            .forEach(py => {
                totalAmountOfAllPayments += Number(py.amount);
            })

        console.log('totalpaymentamount:', totalAmountOfAllPayments);
        return totalAmountOfAllPayments;
    }


    const getTotalPriceOfFactor = (fac) => {
        let totalPriceOfFac = 0
        fac.productsInFactor?.forEach(item => {
            console.log("totalprice of fac: " + fac.id, totalPriceOfFac);
            totalPriceOfFac += Number(item.totalPrice)
        })

        console.log('factor:' + fac.id, totalPriceOfFac);
        return totalPriceOfFac;
    }


    const deleteUserPayment = async (index) => {
        if (updateMode) {
            toast.error('youAreNotAllowedToChangeTheFactor');
            return
        }
        // 
        setUserPayment({
            ...userPayment,
            amount: 0
        })

    }

    const snedCustomerFactorToAPI = async () => {
        if (updateMode) {
            toast.error('youAreNotAllowedToChangeTheFactor');
            return;
        }

        if (customerFactor.productsInFactor.length == 0 ||
            customerFactor.productsInFactor[0].total == 0 ||
            customerFactor.productsInFactor.some(item => item.name.trim().length == 0)
        ) {
            toast.error(t('products') + " " + t('notEmptyMsg'))
            return
        }

        dispatch({
            type: actionTypes.SET_SMALL_LOADING,
            payload: true
        })

        try {

            const factorDoc = await addDoc(salesCollectionRef, { ...customerFactor, paidAmount: userPayment.amount });
            if (userPayment.amount > 0) {
                console.log('sending payment doc: ', userPayment.amount);
                addDoc(paymentCollectionRef, { ...userPayment, saleId: factorDoc.id });
            }
            toast.success(t('successfullyAdded'));
            setsaved(true)
            // nav('/sales')

        } catch (err) {
            toast.error(err)
        } finally {
            dispatch({
                type: actionTypes.SET_SMALL_LOADING,
                payload: false
            })
        }
    }


    // async function updateMultipleDocuments(docUpdates) {
    //     const batch = writeBatch(db); // Create a batch

    //     // Loop through each document update
    //     incompletedFactors.forEach(update => {
    //         const docRef = doc(db, Collections.Sales, update.id); // Get the document reference
    //         batch.update(docRef, update); // Add the update operation to the batch
    //     });

    //     // Commit the batch
    //     try {
    //         await batch.commit();
    //         console.log("Batch update successfully committed!");
    //     } catch (error) {
    //         console.error("Error committing batch update: ", error);
    //     }
    // }

    useEffect(() => {
        if (!customerForSaleFactor) {
            nav(-1)
        }
    }, [])

    console.log(updateMode, saved);

    return (
        <div className='full_width position_relative'>

            <div className='display_flex justify_content_space_between'>

                {/* settings Menu */}
                <Menu >
                    {(updateMode || saved) && <Button
                        icon={ICONS.printer}
                        text={t('readyForPrint')}
                        onClick={() => setshowPrintModal(true)}
                    />}
                    <Button
                        icon={ICONS.trash}
                        text={t("delete")}
                        onClick={() =>
                            toast.error('notImplementedYet')
                        }
                    />
                </Menu>

                <Button
                    text={t('back')}
                    onClick={() => nav(-1)}
                />
            </div>

            <Modal show={showPrintModal} modalClose={() => setshowPrintModal(false)}>
                <FactorForPrint
                    customerFactor={customerFactor}
                    totalAmountOfAllCustomerPayments={totalAmountOfCustomerPayments}
                    totalAmountOfAllFactors={totalAmountOfCustomerFactors}
                    remainedAmount={() => remainedAmount()}
                    totalOfCurrent={() => totalAll()}
                    userPayment={userPayment}
                />
            </Modal>
            <div className='position_relative'>
                {updateMode && <div className='lock_page'></div>}
                <h1 className='title'>{updateMode ? t('update') : t('add')}  {t('factor')} {t('sale')}</h1>

                <div
                    className='customer_information display_flex align_items_center justify_content_space_between margin_top_20 full_width'>
                    <DisplayLogo imgURL={customerImage} />
                    <div className='display_flex'>
                        <span className='bold'>{t('name')}:</span>
                        <span className='info_value'> {customerForSaleFactor?.name}</span>
                        <span className='bold'>{t('lastName')}:</span>
                        <span className='info_value'> {customerForSaleFactor?.lastName}</span>
                        <span className='bold'>{t('phoneNumber')}:</span>
                        <span className='info_value'> {customerForSaleFactor?.phoneNumber}</span>
                    </div>

                    <div className='display_flex align_items_center'>

                        <span className='bold'>{t('createdDate')}:</span>
                        <span className=' short_date'>
                            {<CustomDatePicker value={customerFactor?.createdDate instanceof Timestamp ? customerFactor?.createdDate?.toDate() : new Date(customerFactor?.createdDate)} onChange={e => {
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

                    <div className='display_flex align_items_center'>
                        <span className='bold'>{t('indexNumber')}:</span>
                        <span className=''>
                            {customerFactor.indexNumber}
                        </span>
                    </div>
                </div>

                <div className='full_width ' style={{ overflowX: 'scroll' }}>
                    <table className='custom_table full_width margin_bottom_10 '>
                        <thead>
                            <tr>
                                <th>{t('number')}</th>
                                <th>{t('name')} {t('product')}</th>
                                {/* <th>{t('englishName')}</th> */}
                                <th>{t('total')}</th>
                                <th>{t('pricePer')}</th>
                                <th>{t('discount')}</th>
                                <th>{t('totalPrice')}</th>
                                <th>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerFactor?.productsInFactor?.map((prInFactor, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <select name="products" id="" onChange={(e) => handleSelectProduct(e, index)} defaultValue={prInFactor.productId}>
                                                <option value={null}>
                                                    {t("chooseTheProduct")}
                                                </option>
                                                {products.map(pr => {
                                                    return (
                                                        <option value={pr.id} key={pr.id} selected={prInFactor.productId == pr.id} style={{ width: 'max-content' }}>
                                                            {pr.name}
                                                        </option>
                                                    )
                                                })}
                                            </select>
                                        </td>
                                        {/* <td>{prInFactor.englishName}</td> */}
                                        <td><input type="number" style={{ width: '100px' }} value={prInFactor.total} onChange={e => handleChangeTotalProducts(e, index)} /></td>
                                        <td><input type="number" style={{ width: '100px' }} value={prInFactor.pricePer} onChange={e => handleChangeProductPrice(e, index)} /></td>
                                        <td>
                                            <div className='display_flex align_items_center'>
                                                <input
                                                    type="number"
                                                    value={prInFactor.discount.value}
                                                    style={{ width: '120px' }}
                                                    onChange={(e) => handleChangeProductDiscount(e, index)} />
                                                <select
                                                    name="discount_type"
                                                    style={{ width: '100px' }}
                                                    defaultValue={prInFactor.discount.type}
                                                    onChange={(e) => handleChangeProductDiscountType(e, index)}>
                                                    <option value="percent">{t('percent')}</option>
                                                    <option value="monetary">{t('monetary')}</option>
                                                </select>
                                            </div>
                                        </td>
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
                </div>

                <div className='full_width margin_top_20 padding_top_10 display_flex justify_content_end flex_direction_column align_items_start input'>
                    <h1 className='text_align_center margin_top_10 full_width'>{t('payments')}</h1>
                    <div className='margin_top_10 margin_bottom_10'>
                        <span className=''>{t('totalAll')}: </span>
                        <span className='info_value'>{totalAll()}</span>
                    </div>
                    <div>
                        {!showAddNewPayment && userPayment.amount > 0 && (
                            <div className='margin_top_10 margin_bottom_10 border_1px_solid padding_10'>
                                <span className='info_value'>1: </span>
                                <span className=''>{t('paidAmount')}: </span>
                                <span className='info_value'>{userPayment.amount} </span>
                                <span className=''>{t('date')}: </span>
                                <span className='info_value short_date'>{formatFirebaseDates(userPayment.date)} </span>
                                <span>
                                    <Button
                                        text={t('delete')}
                                        type={'plusBtn'}
                                        id={'delete_payment'}
                                        onClick={deleteUserPayment}
                                    />
                                </span>
                            </div>)
                        }

                        {showAddNewPayment &&
                            <div className='margin_top_10 margin_bottom_10 border_1px_solid padding_10'>
                                <span className='info_value'>{t('paidAmount')}: </span>
                                <span className='info_value'>
                                    <input type="number" onChange={e => setUserPayment({ ...userPayment, amount: Number(e.target.value + "") })} />
                                </span>
                                <span className='info_value'>{t('date')}: </span>
                                <span className='info_value short_date'>
                                    <CustomDatePicker onChange={e => {
                                        const date = jalaliToGregorian(e.year, e.month.number, e.day)
                                        const gDate = new Date();
                                        gDate.setFullYear(date[0])
                                        gDate.setMonth(date[1])
                                        gDate.setDate(date[2]);
                                        setUserPayment({
                                            ...userPayment,
                                            date: gDate
                                        })
                                    }} />
                                </span>
                                <span>
                                    <Button
                                        text={t('save')}
                                        type={'plusBtn'}
                                        id={'add_new_payment'}
                                        onClick={() => setShowAddNewPayment(false)}
                                    />
                                    <Button
                                        text={t('cancel')}
                                        type={'crossBtn'}
                                        id={'cancel_new_payment'}
                                        onClick={() => {
                                            setUserPayment({
                                                ...userPayment,
                                                amount: 0
                                            })
                                            setShowAddNewPayment(false)
                                        }}
                                    />
                                </span>
                            </div>
                        }
                        {
                            userPayment.amount == 0 &&
                            <Button
                                icon={ICONS.plus}
                                text={t('payment')}
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
                        <span className=''>{t('remainedAmount')} {t('of')} {t('thisFactor')}: </span>
                        <span className='info_value'>{remainedAmount() < 0 ? 0 : remainedAmount().toFixed(2)}</span>
                    </div>
                    <div className='margin_top_10 margin_bottom_10'>
                        <span className=''>{t('totalPrevRemainedAmount')}: </span>
                        <span className='info_value'>
                            {Math.abs(totalAmountOfCustomerFactors - totalAmountOfCustomerPayments).toFixed(2)}
                            <MoneyStatus number={(totalAmountOfCustomerFactors - totalAmountOfCustomerPayments)} />
                        </span>
                    </div>
                    <div className='margin_top_10 margin_bottom_10'>
                        <span className=''>{t('totalRemainedAmount')}: </span>
                        <span className='info_value'>
                            {Math.abs(totalAmountOfCustomerFactors - totalAmountOfCustomerPayments + remainedAmount()).toFixed(2)}
                            <MoneyStatus number={(totalAmountOfCustomerFactors - totalAmountOfCustomerPayments + remainedAmount())} />

                        </span>
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
        </div>
    )
}

export default AddSaleFactor