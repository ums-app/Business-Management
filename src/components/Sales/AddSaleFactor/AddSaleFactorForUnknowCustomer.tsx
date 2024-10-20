import { t } from 'i18next';
import React, { ReactEventHandler, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../UI/Button/Button';
import { useStateValue } from '../../../context/StateProvider';
import "../Sales.css"
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker';
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
import MoneyStatus from '../../UI/MoneyStatus/MoneyStatus';
import { FactorType } from '../../../constants/FactorStatus';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import { deleteCustomerPaymentByFactorId, getProductById, getProducts, sendLog } from '../../../Utils/FirebaseTools';
import { Log, Product, UpdateModeProps } from '../../../Types/Types';
import { ProductForSale, userPayment } from './AddSaleFactor';
import Roles from '../../../constants/Roles';
import NotFound from '../../../pages/NotFound/NotFound';
import Circle from '../../UI/Loading/Circle';
import BtnTypes from '../../../constants/BtnTypes';


export const productForSale = {
    productId: '',
    name: "",
    englishName: "",
    total: 0,
    pricePer: 0,
    discount: {
        value: 0,
        type: 'percent'
    },
    totalPrice: 0,
};


const AddSaleFactorForUnknowCustomer: React.FC<UpdateModeProps> = ({ updateMode }) => {
    const [{ authentication, factor }, dispatch] = useStateValue()
    const nav = useNavigate();
    const [showPrintModal, setshowPrintModal] = useState(false);
    const salesCollectionRef = collection(db, Collections.Sales);
    const [products, setProducts] = useState<Product[]>([]);
    const [saved, setsaved] = useState(false)

    const [customerFactor, setcustomerFactor] = useState({
        productsInFactor: [{ ...productForSale }],
        customer: {
            name: ' ',
            lastName: ' ',
            phoneNumber: ' '
        },
        paidAmount: 0,
        createdDate: new Date(),
        indexNumber: 0,
        type: FactorType.SUNDRY_FACTOR,
        by: authentication.email,
        totalAll: 0,
    })

    useEffect(() => {
        const getTotalNumberOfFactors = async () => {
            const snapshot = await getCountFromServer(salesCollectionRef);
            const totalDocs = snapshot.data().count;
            setcustomerFactor({
                ...customerFactor,
                indexNumber: Number(totalDocs) + 1001
            })
        }

        if (!updateMode) {
            getTotalNumberOfFactors();
        }
        getProducts()
            .then(res => {
                setProducts(res)
            })
        addNewProdcut()
        if (updateMode) {
            setcustomerFactor(factor)
        }
    }, [])

    console.log(customerFactor);

    const checkIfProductIsInList = (productId: string) => {
        return customerFactor.productsInFactor.some(item => item.productId == productId)
    }



    const addNewProdcut = () => {
        const tempArr = [...customerFactor.productsInFactor];
        tempArr.push(productForSale);
        setcustomerFactor({
            ...customerFactor,
            productsInFactor: tempArr
        })
    }


    const handleSelectProduct = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {

        const value = e.target.value
        const selectedProduct = products.find(item => item.id == value)
        if (!selectedProduct) return;

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
            pricePer: Number(selectedProduct.price),
            totalPrice: Number(selectedProduct.price),
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

    const handleChangeProductDiscountType = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
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

    // this func is going to calculate the remained value of this factor
    const remainedAmount = () => {
        const total = totalAll();
        return total - Number(customerFactor.paidAmount + '')
    }




    const snedCustomerFactorToAPI = async () => {
        if (updateMode) {
            toast.error('youAreNotAllowedToChangeTheFactor');
            return;
        }

        if (customerFactor.customer.name.trim().length === 0) {
            toast.error(t('name') + " " + t('notEmptyMsg'));
            return;
        }
        if (remainedAmount() > 0) {
            toast.error(t('paidAmount') + " " + t('notEmptyMsg'));
            return;
        }
        if (customerFactor.productsInFactor.length === 0 || customerFactor.productsInFactor[0].total === 0) {
            toast.error(t('products') + " " + t('notEmptyMsg'));
            return;
        }

        console.log('set loading');
        dispatch({
            type: actionTypes.SET_SMALL_LOADING,
            payload: true,
        });

        try {
            await runTransaction(db, async (transaction) => {
                console.log('sending data to api as new factor');
                console.log(customerFactor);

                // 1. Add a new factor document to the sales collection
                const factorDocRef = doc(collection(db, Collections.Sales));
                transaction.set(factorDocRef, { ...customerFactor, totalAll: totalAll() });

                // 2. Add a payment document to the payments collection
                if (customerFactor.paidAmount > 0) {
                    const paymentDocRef = doc(collection(db, Collections.Payments)); // Assuming you are using 'payments' collection
                    const userPay: userPayment = {
                        amount: customerFactor.paidAmount,
                        createdDate: customerFactor.createdDate,
                        customerId: null,
                        date: customerFactor.createdDate,
                        saleId: factorDocRef.id, // Reference to the sale/factor
                        by: `${authentication.name} ${authentication.lastname}`,
                    };
                    transaction.set(paymentDocRef, userPay);
                }

                // 3. Update inventory for products in the factor
                for (const pr of customerFactor.productsInFactor) {
                    const productDocRef = doc(db, Collections.Products, pr.productId);
                    const targetProduct = products.find((item) => item.id === pr.productId);
                    if (!targetProduct) throw new Error(`Product with ID ${pr.productId} not found`);

                    // Decrease inventory in the transaction
                    transaction.update(productDocRef, {
                        inventory: Number(targetProduct.inventory) - Number(pr.total),
                    });
                }
                const sanitizedLog = Object.fromEntries(Object.entries(customerFactor).filter(([_, v]) => v != null));

                // 4. Log the successful transaction
                const log: Log = {
                    createdDate: new Date(),
                    registrar: `${authentication.name} ${authentication.lastname}`, // Track the current user
                    title: `${t('add')} ${t('factor')}`,
                    message: `${t('factor')} [${factorDocRef.id}] ${t('successfullyAdded')} `,
                    data: sanitizedLog
                };
                await sendLog(log); // Outside the transaction
                setcustomerFactor({ ...customerFactor, id: factorDocRef.id }); // Update local factor state with the ID
            });

            toast.success(t('successfullyAdded'));
            setsaved(true);
            // nav('/sales'); // Uncomment if you want to navigate after the operation

        } catch (err) {
            console.error("Transaction failed: ", err);
            toast.error(t('operationFailedMsg'));
        } finally {
            dispatch({
                type: actionTypes.SET_SMALL_LOADING,
                payload: false,
            });
        }

        console.log('set loading false');
    };




    const showDeleteModal = () => {
        dispatch({
            type: actionTypes.SHOW_ASKING_MODAL,
            payload: {
                show: true,
                message: "deleteMessage",
                btnAction: deleteFactor,
            },
        });
    };


    const deleteFactor = async () => {
        dispatch({
            type: actionTypes.SET_GLOBAL_LOADING,
            payload: { value: true },
        });
        dispatch({
            type: actionTypes.HIDE_ASKING_MODAL,
        });

        console.log(customerFactor.id);
        const factorDoc = doc(db, Collections.Sales, customerFactor.id);

        try {
            await runTransaction(db, async (transaction) => {
                // Delete the factor document
                transaction.delete(factorDoc);

                // Increase product inventory
                const productsInFactor = customerFactor.productsInFactor;
                for (const pr of productsInFactor) {
                    const productDoc = doc(db, Collections.Products, pr.productId);
                    const targetProduct = products.find(item => item.id === pr.productId);
                    if (!targetProduct) throw new Error(`Product with ID ${pr.productId} not found`);

                    // Increment inventory
                    transaction.update(productDoc, {
                        inventory: Number(targetProduct.inventory) + Number(pr.total)
                    });
                }

                // If there's a payment, delete the corresponding payment
                if (customerFactor.paidAmount > 0) {
                    console.log('delete the factor payments factor id:', customerFactor.id);
                    // Await the result of deleting the payment
                    await deleteCustomerPaymentByFactorId(customerFactor.id, transaction);
                }
            });
            // Remove undefined or null values
            const sanitizedLog = Object.fromEntries(Object.entries(customerFactor).filter(([_, v]) => v != null));

            const log: Log = {
                createdDate: new Date(),
                registrar: `${authentication.name} ${authentication.lastname}`, // Assume you have a way to track the current user
                title: `${t('delete')} ${t('factor')}`,
                message: ` ${t('factor')} [${customerFactor.id}] ${t('successfullyDeleted')}`,
                data: sanitizedLog
            };

            await sendLog(log);
            toast.success(t('successfullyDeleted'));
            nav(-1);
        } catch (err) {
            toast.error(t('operationFailedMsg'))
            console.error("Transaction failed: ", err);
        } finally {
            dispatch({
                type: actionTypes.SET_GLOBAL_LOADING,
                payload: { value: false },
            });
        }
    };


    if (!customerFactor) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }


    if (!authentication.isAuthenticated) {
        return <Circle />; // or return null; for no UI during loading
    }


    if (!authentication.roles.includes(Roles.ADMIN) && !authentication.roles.includes(Roles.SUPER_ADMIN)) {
        return <NotFound />
    }


    return (
        <div className='full_width'>
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
                            showDeleteModal()
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
                    totalAmountOfAllCustomerPayments={0}
                    totalAmountOfAllFactors={0}
                    remainedAmount={() => remainedAmount()}
                    totalOfCurrent={() => totalAll()}
                // userPayment={userPayment}
                />
            </Modal>


            <div className='position_relative'>
                {(updateMode || saved) && <div className='lock_page'></div>}

                <h1 className='title'>{!updateMode && t('add')}  {t('sundryFactor')}</h1>

                <div
                    className='customer_information display_flex align_items_center justify_content_space_between flex_flow_wrap margin_top_20 full_width'>
                    <div className='display_flex'>
                        <span className='bold'>{t('name')}:</span>
                        <span className='info_value'>
                            <input type="text"
                                value={customerFactor?.customer?.name}
                                onChange={e => setcustomerFactor({ ...customerFactor, customer: { ...customerFactor.customer, name: e.target.value } })}
                            />
                        </span>
                        <span className='bold'>{t('lastName')}:</span>
                        <span className='info_value'>
                            <input type="text"
                                value={customerFactor?.customer?.lastName}
                                onChange={e => setcustomerFactor({ ...customerFactor, customer: { ...customerFactor.customer, lastName: e.target.value } })}
                            />
                        </span>
                        <span className='bold'>{t('phoneNumber')}:</span>
                        <span className='info_value'>
                            <input type="text"
                                value={customerFactor?.customer?.phoneNumber}
                                onChange={e => setcustomerFactor({ ...customerFactor, customer: { ...customerFactor.customer, phoneNumber: e.target.value } })}
                            />
                        </span>
                    </div>

                    <div className='display_flex align_items_center'>

                        <span className='bold'>{t('createdDate')}:</span>
                        <span className=' short_date'>
                            {<CustomDatePicker value={customerFactor?.createdDate instanceof Timestamp ? customerFactor?.createdDate?.toDate() : new Date(customerFactor?.createdDate)} onChange={e => {
                                const date = jalaliToGregorian(e.year, e.month.number, e.day)
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
                            {customerFactor?.indexNumber}
                        </span>
                    </div>
                </div>

                <div className='full_width margin_top_20' style={{ overflowX: 'scroll' }}>
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
                                                        <option value={pr.id} key={pr.id}
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
                                                text={t('delete')}
                                                btnType={BtnTypes.danger}
                                                onClick={() => handleDeleteProduct(index)}
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
                                type={'plusBtn'}
                                id={'add_new_row'}
                            />
                            }
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
                        <div className='margin_top_10 margin_bottom_10'>
                            <span className='info_value'>{t('paidAmount')}: </span>
                            <span className='info_value'>
                                <input type="number"
                                    value={customerFactor.paidAmount}
                                    onChange={e => setcustomerFactor({ ...customerFactor, paidAmount: Number(e.target.value + "") })} />
                            </span>
                        </div>
                    </div>
                    <div className='margin_top_10 margin_bottom_10'>
                        <span className=''>{t('remainedAmount')}: </span>
                        <span className='info_value'>
                            {Math.abs(remainedAmount())}
                            <MoneyStatus number={remainedAmount()} />
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

export default AddSaleFactorForUnknowCustomer