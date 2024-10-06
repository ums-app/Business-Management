import { t } from 'i18next';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../UI/Button/Button';
import { Product } from '../../../Types/Types';
import { collection, doc, getCountFromServer, Timestamp, writeBatch } from 'firebase/firestore';
import ICONS from '../../../constants/Icons';
import { getProducts } from '../../../Utils/FirebaseTools';
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker';
import { jalaliToGregorian } from 'shamsi-date-converter';
import Collections from '../../../constants/Collections';
import { db } from '../../../constants/FirebaseConfig';


export interface PurchasedProduct {
    productId: string
    productName: string,
    totalPackage: number,
    totalNumber: number,
    customsCosts: number,
    additionalCosts: number,
    total: number,
    pricePer: number
}

export interface PurchaseFactor {
    products: PurchasedProduct[];
    totalProducts: number;
    totalAmount: number;
    indexNumber: number,
    createdDate: Timestamp | Date
}


const AddPurchaseProducts: React.FC = () => {
    const nav = useNavigate();
    const [purchaseFactor, setPurchaseFactor] = useState<PurchaseFactor>({
        products: [{
            productName: '',
            productId: '',
            customsCosts: 0,
            total: 0,
            additionalCosts: 0,
            totalPackage: 0,
            totalNumber: 0,
            pricePer: 0

        }],
        createdDate: new Date(),
        indexNumber: 0,
        totalAmount: 0,
        totalProducts: 0
    });
    const [products, setproducts] = useState<Product[]>([])
    const purchasedProductCollectionRef = collection(db, Collections.Purchases);

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
            pricePer: 0

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
                pricePer: 0
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
    const handleTotalEachRow = (product: PurchasedProduct): number => {
        return product.additionalCosts + product.customsCosts + (product.pricePer * product.totalNumber);
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
            case 'totalAll':
                purchaseFactor.products.forEach(item => total += item.total)
                return total;
            default:
                return 0
        }

    }

    const sendDateToAPI = async () => {



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


    return (
        <div className='full_width fade_in'>
            <Button
                text={t('back')}
                onClick={() => nav(-1)}
            />
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

            <table className='custom_table full_width'>
                <thead>
                    <tr>
                        <td>{t('number')}</td>
                        <td>{t("name")}</td>
                        <td>{t("total")} {t('package')}</td>
                        <td>{t('total')}</td>
                        <td>{t('pricePer')}</td>
                        <td>{t('customsFees')}</td>
                        <td>{t('additionalCosts')}</td>
                        <td>{t("totalAll")}</td>
                        <td>{t("actions")}</td>
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
                                    >
                                        <option value={undefined}>{t("chooseTheProduct")}</option>
                                        {products.map(pr => {
                                            return <option value={pr.id}>{pr.name}</option>
                                        })}
                                    </select>
                                </td>
                                <td><input type="number" name="" style={{ width: '100px' }} value={item.totalPackage} onChange={e => handleChangeTotalPackage(e, index)} /></td>
                                <td><input type="number" name="" style={{ width: '100px' }} value={item.totalNumber} onChange={e => handleChangeTotalNumber(e, index)} /></td>
                                <td><input type="number" name="" style={{ width: '100px' }} value={item.pricePer} onChange={e => handleChangePricePer(e, index)} /></td>
                                <td><input type="number" name="" style={{ width: '100px' }} value={item.customsCosts} onChange={e => handleChangeCustomsCosts(e, index)} /></td>
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


            <table className='custom_table full_width margin_top_20'>
                <thead style={{ background: 'orange' }}>
                    <tr>
                        <th colSpan={5}>{t('summarize')}</th>
                    </tr>
                    <tr>
                        <td>{t("total")} {t('package')}</td>
                        <td>{t('total')}</td>
                        <td>{t('customsFees')}</td>
                        <td>{t('additionalCosts')}</td>
                        <td>{t("totalAll")}</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td> {summarize('package')}</td>
                        <td>{summarize('totalProduct')}</td>
                        <td>{summarize('customsFees')}</td>
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
    )
}

export default AddPurchaseProducts