import { t } from 'i18next';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../UI/Button/Button';
import { useStateValue } from '../../../context/StateProvider';
import "../Sales.css"
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker';
// import { getEmployeeById, getUserImage } from '../../../Utils/FirebaseTools';
import DisplayLogo from '../../UI/DisplayLogo/DisplayLogo';
import ICONS from '../../../constants/Icons';
import { Timestamp, addDoc, collection, deleteDoc, doc, getCountFromServer, getDocs, query, runTransaction, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from '../../../constants/FirebaseConfig';
import Collections from '../../../constants/Collections';
import { Tooltip } from 'react-tooltip';
import { jalaliToGregorian } from 'shamsi-date-converter';
import { actionTypes } from '../../../context/reducer';
import { toast } from 'react-toastify';
import FactorForPrint from '../FactorForPrint/FactorForPrint';
import Modal from '../../UI/modal/Modal';
import Menu from "../../UI/Menu/Menu"
import { FactorType } from '../../../constants/FactorStatus';
import MoneyStatus from '../../UI/MoneyStatus/MoneyStatus';
import { VisitorContractType } from '../../../constants/Others';
import { productForSale } from './AddSaleFactorForUnknowCustomer';
import { CustomerFactor, CustomerPayment, Employee, Product, UpdateModeProps } from '../../../Types/Types';
import { getAllCustomerPayments, getCustomerFactors, getEmployeeById, getProducts, getUserImage } from '../../../Utils/FirebaseTools';

export interface ProductForSale {
    productId: string;
    name: string,
    englishName: string,
    total: number,
    pricePer: number,
    discount: {
        value: number;
        type: string
    },
    totalPrice: number,
};


export interface userPayment {
    amount: number;
    createdDate: Date;
    by: string;
    saleId: string;
    customerId: string;
    date: Date;
}



const AddSaleFactor: React.FC<UpdateModeProps> = ({ updateMode }) => {

    const [{ authentication, customerForSaleFactor, factor }, dispatch] = useStateValue()
    const nav = useNavigate();
    const [showPrintModal, setshowPrintModal] = useState(false);
    const [customerImage, setcustomerImage] = useState();
    const [customerFactors, setCustomeractors] = useState<CustomerFactor[]>([]);
    const productCollectionRef = collection(db, Collections.Products)
    const salesCollectionRef = collection(db, Collections.Sales);
    const paymentCollectionRef = collection(db, Collections.Payments);
    const [allCustomerPayments, setAllCustomerPayments] = useState<CustomerPayment[]>([]);
    const [totalAmountOfCustomerPayments, settotalAmountOfCustomerPayments] = useState(0)
    const [totalAmountOfCustomerFactors, settotalAmountOfCustomerFactors] = useState(0)
    const [products, setProducts] = useState<Product[]>([]);
    const [saved, setsaved] = useState(false)
    const [visitor, setvisitor] = useState<Employee>()

    // this is for tracking all user payments
    const [userPayment, setUserPayment] = useState<CustomerPayment>({
        id: '',
        amount: 0,
        createdDate: new Date(),
        by: authentication.email,
        saleId: factor?.id,
        customerId: customerForSaleFactor?.id,
        date: new Date(),
        checkNumber: Math.random() * 1000
    })

    const [showAddNewPayment, setShowAddNewPayment] = useState(false);
    const [customerFactor, setcustomerFactor] = useState<CustomerFactor>(() => ({
        id: '',
        productsInFactor: [],
        customer: customerForSaleFactor,
        createdDate: new Date(),
        indexNumber: 0,
        type: FactorType.STANDARD_FACTOR,
        by: authentication.email,
        paidAmount: 0,
        totalAll: 0,
        visitorAccount: null,
        currentRemainedAmount: 0,
        previousRemainedAmount: 0,
    }))

    useEffect(() => {
        settotalAmountOfCustomerPayments(totalAmountOfAllCustomerPayments());
        settotalAmountOfCustomerFactors(totalAmountOfAllFactors());
        if (!customerForSaleFactor) {
            nav("/sales")
        }
    }, [allCustomerPayments])


    useEffect(() => {
        const getTotalNumberOfFactors = async () => {
            const snapshot = await getCountFromServer(salesCollectionRef);
            const totalDocs = snapshot.data().count;
            setcustomerFactor({
                ...customerFactor,
                indexNumber: Number(totalDocs) + 1001
            })
        }

        addNewProdcut()
        if (updateMode) {
            setcustomerFactor(factor)
        }

        if (!updateMode) {
            getTotalNumberOfFactors();
        }

    }, [])

    useEffect(() => {
        getUserImage(customerForSaleFactor?.email).then(res => setcustomerImage(res))
            .catch(err => setcustomerImage(err))
        getProducts()
            .then(res => {
                setProducts(res)
            });

        getCustomerFactorsForThisComponent();
        getAllCustomerPayments(customerForSaleFactor.id)
            .then(res => {
                setAllCustomerPayments(res)
            })

        getEmployeeById(customerForSaleFactor.visitor)
            .then(res => {
                if (res)
                    setvisitor(res)
            })
            .catch(err => {
                console.log(err);
            })

    }, [])
    console.log(customerFactor);



    const checkIfProductIsInList = (productId: string) => {
        return customerFactor.productsInFactor.some(item => item.productId == productId)
    }




    const getCustomerFactorsForThisComponent = async () => {
        getCustomerFactors(customerForSaleFactor.id)
            .then(res => {
                let items = res;
                if (updateMode) {
                    items = items.filter(fac => fac.id != customerFactor.id);
                }
                setCustomeractors(items);
            })
    }


    const addNewProdcut = () => {
        const tempArr = [...customerFactor.productsInFactor];
        tempArr.push({
            discount: {
                type: 'percent',
                value: 0
            },
            englishName: '',
            name: '',
            pricePer: 0,
            productId: '',
            total: 0,
            totalPrice: 0
        });
        setcustomerFactor({
            ...customerFactor,
            productsInFactor: tempArr
        })
    }


    const handleSelectProduct = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
        const value = e.target.value
        const selectedProduct = products.find(item => item.id == value)
        console.log(selectedProduct);
        if (selectedProduct) {
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
        }
        setcustomerFactor({
            ...customerFactor,
            productsInFactor: [...customerFactor.productsInFactor]
        })
    }

    const handleChangeTotalProducts = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const pr = customerFactor.productsInFactor[index];

        pr.total = Number(e.target.value);
        pr.totalPrice = caculateTotalPriceOfProduct(pr);

        customerFactor.productsInFactor[index] = pr;

        setcustomerFactor({
            ...customerFactor,
            productsInFactor: [...customerFactor.productsInFactor]
        })
    }

    const handleChangeProductPrice = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const pr = customerFactor.productsInFactor[index];

        pr.pricePer = Number(e.target.value);
        pr.totalPrice = caculateTotalPriceOfProduct(pr);

        customerFactor.productsInFactor[index] = pr;
        setcustomerFactor({
            ...customerFactor,
            productsInFactor: [...customerFactor.productsInFactor]
        })

    }

    const handleChangeProductDiscount = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
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

    const handleChangeProductDiscountType = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
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

    const caculateTotalPriceOfProduct = (product: ProductForSale) => {
        let discount = product.discount.value;
        if (product.discount.type == 'percent') {
            discount = (discount * product.pricePer) / 100;
        }
        console.log(product.discount);
        console.log(discount);

        return product.total * (product.pricePer - discount);
    }

    const handleDeleteProduct = (index: number) => {
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

    const getTotalProductsOfFactor = () => {
        let total = 0;
        customerFactor.productsInFactor.forEach(item => total += Number(item.total + ''))

        return total;
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
            getCustomerFactorsForThisComponent();
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
        let totalAmountOfAllPayments = 0;
        allCustomerPayments
            .filter(item => item.createdDate < customerFactor.createdDate)
            .forEach(py => {
                totalAmountOfAllPayments += Number(py.amount);
            })
        return totalAmountOfAllPayments;
    }


    const getTotalPriceOfFactor = (fac: CustomerFactor) => {
        let totalPriceOfFac = 0
        fac.productsInFactor?.forEach(item => {
            totalPriceOfFac += Number(item.totalPrice)
        })

        return totalPriceOfFac;
    }


    const deleteUserPayment = () => {
        if (updateMode) {
            toast.error('youAreNotAllowedToChangeTheFactor');
            return
        }
        // 
        setUserPayment({
            ...userPayment,
            amount: 0
        })
        setcustomerFactor({ ...customerFactor, paidAmount: 0 })
        setShowAddNewPayment(false)

    }


    const saveUserPayment = () => {
        if (updateMode) {
            toast.error('youAreNotAllowedToChangeTheFactor');
            return
        }
        // 
        setcustomerFactor({ ...customerFactor, paidAmount: userPayment.amount })
        setShowAddNewPayment(false)
        console.log('saved and closed');
    }


    const sendCustomerFactorToAPI = async () => {
        if (updateMode) {
            toast.error('youAreNotAllowedToChangeTheFactor');
            return;
        }

        if (customerFactor.productsInFactor.length === 0 ||
            customerFactor.productsInFactor[0].total === 0 ||
            customerFactor.productsInFactor.some(item => item.name.trim().length === 0)
        ) {
            toast.error(t('products') + " " + t('notEmptyMsg'));
            return;
        }

        dispatch({
            type: actionTypes.SET_SMALL_LOADING,
            payload: true
        });

        try {
            let visitorAmount = 0;
            if (visitor && visitor.visitorContractType === VisitorContractType.BASED_ON_PRODUCT_NUMBER) {
                visitorAmount = getTotalProductsOfFactor() * visitor.visitorAmount;
            } else if (visitor && visitor.visitorContractType === VisitorContractType.PERCENT) {
                visitorAmount = (totalAll() * Number(visitor?.visitorAmount) / 100);
            }

            const visitorAccount = visitor && visitor.visitorContractType ? {
                visitorId: visitor?.id ?? null,
                VisitorContractType: visitor?.visitorContractType ?? null,
                visitorContractAmount: visitor?.visitorAmount ?? null,
                visitorAmount: visitorAmount ?? null
            } : undefined;

            const factorData = {
                ...customerFactor,
                paidAmount: userPayment.amount,
                totalAll: totalAll(),
                ...(visitorAccount ? { visitorAccount } : {}), // Conditionally include visitorAccount,
                currentRemainedAmount: remainedAmount(),
                previousRemainedAmount: Math.abs(totalAmountOfAllFactors() - totalAmountOfAllCustomerPayments()).toFixed(2),
                totalRemainedAmount: Math.abs((totalAmountOfAllFactors() - totalAmountOfAllCustomerPayments()) + remainedAmount()).toFixed(2)
            };

            // Using transaction to add the first document
            const factorDocRef = doc(collection(db, Collections.Sales)); // Assuming you are using 'sales' collection
            await runTransaction(db, async (transaction) => {
                transaction.set(factorDocRef, factorData); // Set the factor data in the transaction

                if (userPayment.amount > 0) {
                    console.log('sending payment doc: ', userPayment.amount);
                    const paymentDocRef = doc(collection(db, Collections.Payments)); // Assuming you are using 'payments' collection
                    transaction.set(paymentDocRef, { ...userPayment, saleId: factorDocRef.id });
                }
            });

            // Call the update function, which will also use a transaction
            await updateMultipleDocuments(customerFactor.productsInFactor);

            toast.success(t('successfullyAdded'));

            setsaved(true);
            setcustomerFactor({
                ...customerFactor,
                paidAmount: userPayment.amount,
                totalAll: totalAll(),
                visitorAccount: visitor ? {
                    visitorId: visitor?.id ?? null,
                    VisitorContractType: visitor?.visitorContractType ?? null,
                    visitorContractAmount: visitor?.visitorAmount ?? null,
                    visitorAmount: visitorAmount ?? null
                } : null
            });

        } catch (err: any) {
            console.error('Error in API call: ', err);
            toast.error(err.message || 'An error occurred');
        } finally {
            dispatch({
                type: actionTypes.SET_SMALL_LOADING,
                payload: false
            });
            console.log('loading finished');
        }
    };

    async function updateMultipleDocuments(productsInFactor: ProductForSale[]) {
        const batch = writeBatch(db); // Create a batch

        // Loop through each document update
        productsInFactor.forEach(pr => {
            const docRef = doc(db, Collections.Products, pr.productId); // Get the document reference
            const targetProduct = products.find(item => item.id === pr.productId);
            if (!targetProduct) return;
            batch.update(docRef, { inventory: targetProduct?.inventory - pr.total }); // Update inventory
        });

        // Commit the batch
        try {
            await batch.commit();
            console.log("Batch update successfully committed!");
        } catch (error) {
            console.error("Error committing batch update: ", error);
            throw error; // Rethrow the error to handle rollback in sendCustomerFactorToAPI
        }
    }



    if (!customerForSaleFactor) {
        nav(-1)
        return;
    }



    console.log(customerFactor);


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
                {(updateMode || saved) && <div className='lock_page'></div>}
                <h1 className='title'>{updateMode ? t('update') : t('add')}  {t('factor')} {t('sale')}</h1>

                <div
                    className='customer_information display_flex align_items_center justify_content_space_between margin_top_20 full_width'>
                    <DisplayLogo imgURL={customerImage} alt={customerForSaleFactor?.name} />
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
                            {<CustomDatePicker
                                value={customerFactor?.createdDate instanceof Timestamp ? customerFactor?.createdDate?.toDate() : new Date(customerFactor?.createdDate)}
                                onChange={(e: any) => {
                                    const date = jalaliToGregorian(e.year, e.month.number, e.day).join('/')
                                    const gDate = new Date(date);
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
                                                <option value={undefined}>
                                                    {t("chooseTheProduct")}
                                                </option>
                                                {products.map(pr => {
                                                    return (
                                                        <option
                                                            value={pr.id} key={pr.id}
                                                            selected={prInFactor.productId == pr.id} style={{ width: 'max-content' }}
                                                            disabled={checkIfProductIsInList(pr.id)}
                                                        >
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
                                                btnType={'crossBtn'}
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

                            {customerFactor.productsInFactor.length < products.length && <Button
                                icon={ICONS.plus}
                                onClick={addNewProdcut}
                                btnType={'plusBtn'}
                                id={'add_new_row'}
                            />}
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
                            <div className='margin_top_10 margin_bottom_10'>
                                <span className=''>{t('paidAmount')}: </span>
                                <span className='info_value'>{userPayment.amount} </span>
                                {!updateMode && <span>
                                    <Button
                                        text={t('delete')}
                                        btnType={'plusBtn'}
                                        id={'delete_payment'}
                                        onClick={deleteUserPayment}
                                    />
                                </span>}
                            </div>)
                        }

                        {showAddNewPayment &&
                            <div className='margin_top_10 margin_bottom_10 border_1px_solid padding_10'>
                                <span className='info_value'>{t('paidAmount')}: </span>
                                <span className='info_value'>
                                    <input type="number" onChange={e => setUserPayment({ ...userPayment, amount: Number(e.target.value + "") })} />
                                </span>
                                <span>
                                    <Button
                                        text={t('save')}
                                        btnType={'plusBtn'}
                                        id={'add_new_payment'}
                                        onClick={saveUserPayment}
                                    />
                                    <Button
                                        text={t('cancel')}
                                        btnType={'crossBtn'}
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
                                btnType={'plusBtn'}
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
                        btnType={'plusBtn'}
                        id={'save_customer_factor'}
                        onClick={sendCustomerFactorToAPI}
                    />
                </div>


            </div>
        </div>
    )
}

export default AddSaleFactor