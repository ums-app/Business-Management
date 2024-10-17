import { t } from 'i18next';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../UI/Button/Button';
import { Product, UpdateModeProps } from '../../../Types/Types';
import { collection, deleteDoc, doc, getCountFromServer, runTransaction, Timestamp, writeBatch } from 'firebase/firestore';
import ICONS from '../../../constants/Icons';
import { getProducts } from '../../../Utils/FirebaseTools';
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker';
import { jalaliToGregorian } from 'shamsi-date-converter';
import Collections from '../../../constants/Collections';
import { db } from '../../../constants/FirebaseConfig';
import { toast } from 'react-toastify';
import { useStateValue } from '../../../context/StateProvider';
import { actionTypes } from '../../../context/reducer';
import Menu from '../../UI/Menu/Menu';
import Roles from '../../../constants/Roles';
import NotFound from '../../../pages/NotFound/NotFound';
import { CurrencyType } from '../../../constants/Others';


export interface PurchasedProduct {
    productId: string
    productName: string,
    totalPackage: number,
    totalNumber: number,
    customsCosts: number,
    additionalCosts: number,
    total: number,
    pricePer: number,
    factoryExpenses: number,
}

export interface PurchaseFactor {
    products: PurchasedProduct[];
    totalProducts: number;
    totalAmount: number;
    indexNumber: number,
    totalPackage: number,
    createdDate: Timestamp | Date,
    currency: string
}


const AddPurchaseProducts: React.FC<UpdateModeProps> = ({ updateMode = false }) => {
    const nav = useNavigate();
    const { purchaseProductId } = useParams();
    const [{ authentication, PurchaseFactor }, dispatch] = useStateValue()
    const [purchaseFactor, setPurchaseFactor] = useState<PurchaseFactor>(updateMode ? PurchaseFactor : {
        products: [{
            productName: '',
            productId: '',
            customsCosts: 0,
            total: 0,
            additionalCosts: 0,
            totalPackage: 0,
            totalNumber: 0,
            pricePer: 0,
            factoryExpenses: 0

        }],
        createdDate: new Date(),
        indexNumber: 0,
        totalAmount: 0,
        totalProducts: 0,
        totalPackage: 0,
        currency: CurrencyType.USD
    });
    const [products, setproducts] = useState<Product[]>([])
    const purchasedProductCollectionRef = collection(db, Collections.Purchases);

    const [saved, setsaved] = useState(false)

    useEffect(() => {
        getProducts().then(res => {
            setproducts(res)
        })
        const getTotalNumberOfFactors = async () => {
            const snapshot = await getCountFromServer(purchasedProductCollectionRef);
            const totalDocs = snapshot.data().count;
            setPurchaseFactor({
                ...purchaseFactor,
                indexNumber: Number(totalDocs) + 1001
            })
        }

        getTotalNumberOfFactors();
        if (updateMode) {
            setPurchaseFactor(PurchaseFactor)
        }

    }, [])




    const addNewRow = () => {
        const prods = [...purchaseFactor.products];
        prods.push({
            productName: '',
            productId: '',
            customsCosts: 0,
            total: 0,
            additionalCosts: 0,
            totalPackage: 0,
            totalNumber: 0,
            pricePer: 0,
            factoryExpenses: 0

        });
        setPurchaseFactor({
            ...purchaseFactor,
            products: prods,
        })

    }

    const removeRow = (index: number) => {
        const prods = [...purchaseFactor.products];
        prods.splice(index, 1);
        setPurchaseFactor({
            ...purchaseFactor,
            products: prods,
        })
    }

    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
        const product = products.find(item => item.id == e.target.value)
        if (product) {
            const prods = [...purchaseFactor?.products]

            prods[index] = {
                productName: product.name,
                productId: product.id,
                customsCosts: 0,
                total: 0,
                additionalCosts: 0,
                totalPackage: 0,
                totalNumber: 0,
                pricePer: 0,
                factoryExpenses: 0
            };
            setPurchaseFactor({
                ...purchaseFactor,
                products: prods,
            })
        }

    }

    const handleChangeTotalNumber = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const prods = [...purchaseFactor?.products]
        prods[index] = {
            ...prods[index],
            totalNumber: Number(e.target.value)
        };
        //total
        prods[index] = {
            ...prods[index],
            total: handleTotalEachRow(prods[index])
        }
        setPurchaseFactor({
            ...purchaseFactor,
            products: prods,
        })

    }

    const handleChangePricePer = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const prods = [...purchaseFactor?.products]
        prods[index] = {
            ...prods[index],
            pricePer: Number(e.target.value)
        };
        //total
        prods[index] = {
            ...prods[index],
            total: handleTotalEachRow(prods[index])
        }
        setPurchaseFactor({
            ...purchaseFactor,
            products: prods,
        })

    }

    const handleChangeTotalPackage = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const prods = [...purchaseFactor?.products]
        prods[index] = {
            ...prods[index],
            totalPackage: Number(e.target.value)
        };
        //total
        prods[index] = {
            ...prods[index],
            total: handleTotalEachRow(prods[index])
        }
        setPurchaseFactor({
            ...purchaseFactor,
            products: prods,
        })

    }
    const handleChangeAdditionalCosts = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const prods = [...purchaseFactor?.products]
        prods[index] = {
            ...prods[index],
            additionalCosts: Number(e.target.value)
        };
        //total
        prods[index] = {
            ...prods[index],
            total: handleTotalEachRow(prods[index])
        }
        setPurchaseFactor({
            ...purchaseFactor,
            products: prods,
        })

    }
    const handleChangeCustomsCosts = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const prods = [...purchaseFactor?.products]
        prods[index] = {
            ...prods[index],
            customsCosts: Number(e.target.value)
        };
        //total
        prods[index] = {
            ...prods[index],
            total: handleTotalEachRow(prods[index])
        }
        setPurchaseFactor({
            ...purchaseFactor,
            products: prods,
        })

    }
    const handleChangefactoryExpenses = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const prods = [...purchaseFactor?.products]
        prods[index] = {
            ...prods[index],
            factoryExpenses: Number(e.target.value)
        };
        //total
        prods[index] = {
            ...prods[index],
            total: handleTotalEachRow(prods[index])
        }
        setPurchaseFactor({
            ...purchaseFactor,
            products: prods,
        })

    }
    const handleTotalEachRow = (product: PurchasedProduct): number => {
        return product.additionalCosts + product.factoryExpenses + product.customsCosts + (product.pricePer * product.totalNumber);
    }

    const summarize = (type: string): number => {
        let total = 0
        switch (type) {
            case 'package':
                purchaseFactor.products.forEach(item => total += item.totalPackage)
                return total;
            case 'totalProduct':
                purchaseFactor.products.forEach(item => total += item.totalNumber)
                return total;
            case 'customsFees':
                purchaseFactor.products.forEach(item => total += item.customsCosts)
                return total;
            case 'additionalCosts':
                purchaseFactor.products.forEach(item => total += item.additionalCosts)
                return total;
            case 'factoryExpenses':
                purchaseFactor.products.forEach(item => total += item.factoryExpenses)
                return total;
            case 'totalAll':
                purchaseFactor.products.forEach(item => total += item.total)
                return total;
            default:
                return 0
        }

    }

    const checkIfProductIsInList = (productId: string): boolean => purchaseFactor.products.some(item => item.productId == productId);

    const sendDateToAPI = async () => {
        // do some check
        if (purchaseFactor.products.length == 0)
            toast.error('')


        if (purchaseFactor.products.length === 0 ||
            purchaseFactor.products.some(item => item.totalNumber === 0) ||
            purchaseFactor.products.some(item => item.productName.trim().length === 0)
        ) {
            toast.error(t('products') + " " + t('notEmptyMsg'));
            return;
        }

        dispatch({
            type: actionTypes.SET_SMALL_LOADING,
            payload: true
        });
        const totalAmount = summarize('totalAll')
        const totalProduct = summarize('totalProduct')
        const totalPackage = summarize('package')

        const factorTemp = {
            ...purchaseFactor,
            totalAmount: totalAmount,
            totalProducts: totalProduct,
            totalPackage: totalPackage
        }
        setPurchaseFactor(factorTemp)

        try {

            // Using transaction to add the first document
            const factorDocRef = doc(collection(db, Collections.Purchases)); // Assuming you are using 'sales' collection
            const result = await runTransaction(db, async (transaction) => {
                transaction.set(factorDocRef, factorTemp); // Set the factor data in the transaction
            });

            console.log("transction result: ", result);


            // Call the update function, which will also use a transaction
            await updateMultipleDocuments(purchaseFactor.products);

            toast.success(t('successfullyAdded'));

            setsaved(true);


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
    }

    async function updateMultipleDocuments(productsInFactor: PurchasedProduct[]) {
        const batch = writeBatch(db); // Create a batch

        // Loop through each document update
        productsInFactor.forEach(pr => {
            const docRef = doc(db, Collections.Products, pr.productId); // Get the document reference
            const targetProduct = products.find(item => item.id === pr.productId);
            if (!targetProduct) return;
            batch.update(docRef, { inventory: targetProduct?.inventory + pr.totalNumber }); // Update inventory
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


    const showDeleteModal = () => {
        dispatch({
            type: actionTypes.SHOW_ASKING_MODAL,
            payload: {
                show: true,
                message: "deleteMessage",
                btnAction: deletePurchaseFactor,
            },
        });
    };

    const deletePurchaseFactor = async () => {
        if (!updateMode) return

        dispatch({
            type: actionTypes.SET_GLOBAL_LOADING,
            payload: { value: true },
        });
        dispatch({
            type: actionTypes.HIDE_ASKING_MODAL,
        });


        if (!purchaseProductId) return;

        const factorDoc = doc(db, Collections.Purchases, purchaseProductId);

        try {
            await deleteDoc(factorDoc)
            toast.success(t('successfullyDeleted'));
            nav("/purchase-products")
        } catch (err) {
            console.log(err);
        } finally {
            dispatch({
                type: actionTypes.SET_GLOBAL_LOADING,
                payload: { value: false },
            });
        }

    }


    if (!authentication.roles.includes(Roles.ADMIN) && !authentication.roles.includes(Roles.SUPER_ADMIN)) {
        return <NotFound />
    }

    return (
        <div className='full_width fade_in'>

            <div className='display_flex justify_content_space_between'>

                {/* settings Menu */}
                <Menu >
                    {/* {(updateMode || saved) && <Button
                        icon={ICONS.printer}
                        text={t('readyForPrint')}
                        onClick={() => setshowPrintModal(true)}
                    />} */}
                    {updateMode && <Button
                        icon={ICONS.trash}
                        text={t("delete")}
                        onClick={showDeleteModal}
                    />}
                </Menu>

                <Button
                    text={t('back')}
                    onClick={() => nav(-1)}
                />
            </div>
            <div className='position_relative'>
                {(updateMode || saved) && <div className='lock_page'></div>}


                <h1 className='title'>{t('add')}  {t('purchaseFactor')}</h1>
                <div className='display_flex justify_content_space_between'>
                    <div className='display_flex align_items_center'>

                        <span className='bold'>{t('createdDate')}:</span>
                        <span className=' short_date'>
                            {<CustomDatePicker
                                value={purchaseFactor?.createdDate instanceof Timestamp ? purchaseFactor?.createdDate?.toDate() : new Date(purchaseFactor?.createdDate)}
                                onChange={(e: any) => {
                                    const date = jalaliToGregorian(e.year, e.month.number, e.day).join('/')
                                    const gDate = new Date(date);
                                    setPurchaseFactor({
                                        ...purchaseFactor,
                                        createdDate: gDate
                                    })
                                }} />}
                        </span>
                    </div>

                    <div className='display_flex align_items_center'>
                        <span className='bold'>{t('indexNumber')}: </span>
                        <span className=''>
                            {purchaseFactor.indexNumber}
                        </span>
                    </div>
                </div>
                <div className='overflow_x_scroll'>
                    <table className='custom_table full_width'>
                        <thead>
                            <tr style={{ fontSize: '14px', color: '#fff' }}>
                                <th>{t('number')}</th>
                                <th>{t("name")}</th>
                                <th>{t("total")} {t('package')}</th>
                                <th>{t('total')}</th>
                                <th>{t('pricePer')}</th>
                                <th>{t('totalPurchaseAmount')}</th>
                                <th>{t('customsFees')}</th>
                                <th>{t('factoryExpenses')}</th>
                                <th>{t('additionalCosts')}</th>
                                <th>{t("totalAll")}</th>
                                <th>{t("actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseFactor?.products.map((item, index) => {
                                return (
                                    <tr>
                                        <td>{index + 1}</td>
                                        <td>
                                            <select name="" id=""
                                                onChange={(e) => handleProductChange(e, index)}
                                                style={{ minWidth: '160px' }}
                                            >
                                                <option value={undefined}>{t("chooseTheProduct")}</option>
                                                {products.map(pr => {
                                                    return <option
                                                        selected={item.productId == pr.id} style={{ width: 'max-content' }}
                                                        disabled={checkIfProductIsInList(pr.id)}
                                                        value={pr.id}
                                                    >
                                                        {pr.name}
                                                    </option>
                                                })}
                                            </select>
                                        </td>
                                        <td><input type="number" name="" style={{ width: '100px' }} value={item.totalPackage} onChange={e => handleChangeTotalPackage(e, index)} /></td>
                                        <td><input type="number" name="" style={{ width: '100px' }} value={item.totalNumber} onChange={e => handleChangeTotalNumber(e, index)} /></td>
                                        <td><input type="number" name="" style={{ width: '100px' }} value={item.pricePer} onChange={e => handleChangePricePer(e, index)} /></td>
                                        <td>{item.pricePer * item.totalNumber}</td>
                                        <td><input type="number" name="" style={{ width: '100px' }} value={item.customsCosts} onChange={e => handleChangeCustomsCosts(e, index)} /></td>
                                        <td><input type="number" name="" style={{ width: '100px' }} value={item.factoryExpenses} onChange={e => handleChangefactoryExpenses(e, index)} /></td>
                                        <td><input type="number" name="" style={{ width: '100px' }} value={item.additionalCosts} onChange={e => handleChangeAdditionalCosts(e, index)} /></td>
                                        <td>{item.total}</td>
                                        <td>
                                            <Button
                                                icon={ICONS.trash}
                                                onClick={() => removeRow(index)}
                                            />
                                        </td>
                                    </tr>
                                )
                            })}



                        </tbody>
                        <Button
                            icon={ICONS.plus}
                            btnType=' margin_top_10'
                            onClick={addNewRow}
                        />
                    </table>
                </div>


                <table className='custom_table full_width margin_top_20'>
                    <thead style={{ background: 'orange' }}>
                        <tr>
                            <th colSpan={6}>{t('summarize')}</th>
                        </tr>
                        <tr>
                            <td>{t("total")} {t('package')}</td>
                            <td>{t('total')}</td>
                            <td>{t('customsFees')}</td>
                            <td>{t('factoryExpenses')}</td>
                            <td>{t('additionalCosts')}</td>
                            <td>{t("totalAll")}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td> {summarize('package')}</td>
                            <td>{summarize('totalProduct')}</td>
                            <td>{summarize('customsFees')}</td>
                            <td>{summarize('factoryExpenses')}</td>
                            <td>{summarize('additionalCosts')}</td>
                            <td>{summarize('totalAll')}</td>
                        </tr>
                    </tbody>
                </table>
                <Button
                    icon={ICONS.plus}
                    btnType=' margin_top_10'
                    onClick={sendDateToAPI}
                    text={t('save')}
                />

            </div>


        </div>
    )
}

export default AddPurchaseProducts