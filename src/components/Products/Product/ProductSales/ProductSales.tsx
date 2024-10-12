import { t } from 'i18next'
import React, { useState } from 'react'
import CustomDatePicker from '../../../UI/DatePicker/CustomDatePicker'
import { jalaliToGregorian } from 'shamsi-date-converter'
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore'
import { db } from '../../../../constants/FirebaseConfig'
import Collections from '../../../../constants/Collections'
import { mapDocToCustomerFactor } from '../../../../Utils/Mapper'
import { CustomerFactor, CustomerForSaleFactor } from '../../../../Types/Types'
import Button from '../../../UI/Button/Button'
import { useParams } from 'react-router-dom'
import DisplayLogo from '../../../UI/DisplayLogo/DisplayLogo'
import { getUserImage } from '../../../../Utils/FirebaseTools'
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate'


interface PersonPurchaseRate {
    customer: CustomerForSaleFactor,
    totalElement: number,
    totalAmount: number,
    imageUrl: string
}

const ProductSales: React.FC = () => {
    const { productId } = useParams()
    const [range, setRange] = useState<[]>([])

    const salesCollectionRef = collection(db, Collections.Sales);
    const [factors, setfactors] = useState<CustomerFactor[]>([])
    const [totalSold, settotalSold] = useState<number>(0)
    const [totalAmount, settotalAmount] = useState<number>(0)
    const [topBuier, settopBuier] = useState<any>()
    const [analysReady, setanalysReady] = useState(false)
    const [loading, setLoading] = useState(false)


    const getProductSalesInDatePeriod = async () => {
        setLoading(true)
        const dates: Date[] = range.map(item => new Date(jalaliToGregorian(item.year, item.month.number, item.day).join('/')))
        console.log(dates);
        let q;
        if (dates.length === 1) {
            // If there's only one date, fetch documents where 'eventDate' is equal to that date
            const singleDate = Timestamp.fromDate(dates[0]);

            q = query(
                salesCollectionRef,
                where('createdDate', '==', singleDate),
                // where('products.productId', '==', productId)
            );

        } else if (dates.length === 2) {
            // If there are two dates, fetch documents where 'eventDate' is between the two dates
            const startDate = Timestamp.fromDate(dates[0]);
            const endDate = Timestamp.fromDate(dates[1]);

            q = query(
                salesCollectionRef,
                where('createdDate', '>=', startDate),
                where('createdDate', '<=', endDate),
                // where('products.productId', '==', productId)
            );
        }
        try {
            if (q) {
                const querySnapshot = await getDocs(q);
                // Process the query results
                const docs = querySnapshot.docs.map(doc => mapDocToCustomerFactor(doc));
                console.log(docs);
                setfactors(docs)
                analyseData(docs)
            }
        } catch (err) {
            console.log(err);

        } finally {
            setLoading(false)
        }
    }



    const analyseData = (factors: CustomerFactor[]) => {
        setanalysReady(false)
        let totalElement = 0;
        let totalAmount = 0
        const topBuier: Map<string, PersonPurchaseRate> = new Map();
        factors.forEach(item => {
            item.productsInFactor.forEach(pr => {
                if (pr.productId == productId) {
                    totalElement += Number(pr.total)
                    totalAmount += pr.totalPrice
                    if (item.customer.email) {
                        let person: PersonPurchaseRate | undefined = topBuier.get(item.customer.id);
                        if (person) {
                            console.log(person, pr.total);

                            person = {
                                ...person,
                                totalElement: Number(person.totalElement) + Number(pr.total),
                                totalAmount: person.totalAmount + pr.totalPrice,
                            }
                            topBuier.set(item.customer.id, person);
                        } else {
                            topBuier.set(item.customer.id, {
                                customer: item.customer,
                                totalElement: pr.total,
                                totalAmount: pr.totalPrice,
                                imageUrl: item.customer.email
                            })
                        }
                    }
                }
            })
        })
        console.log('total sold: ', totalElement);
        console.log('total sold amount: ', totalAmount);
        console.log(topBuier.values());

        if (topBuier.size > 0) {
            let top: PersonPurchaseRate = topBuier.values().toArray()[0];
            topBuier.values().forEach(item => {
                if (item.totalElement >= top.totalElement) {
                    top = item;
                }
            })
            if (top) {
                getUserImage(top?.customer?.email)
                    .then(url => {
                        top = {
                            ...top,
                            imageUrl: url
                        }
                    })
                    .finally(() => {
                        settopBuier(top)
                    })
            }
        }



        settotalAmount(totalAmount)
        settotalSold(totalElement)
        setanalysReady(true)

    }


    console.log(totalAmount, totalSold, topBuier);




    return (
        <div>
            <div className='text_align_center margin_top_20'>
                {/* <span>{t('chooseDatePeriod')}: </span> */}
                <CustomDatePicker
                    range
                    onChange={(e: any) => {
                        // console.log(typeof e);
                        // console.log(e);
                        setRange(e)


                    }}
                    placeholder={t('chooseDatePeriod')}
                />
                <Button
                    text={t('apply')}
                    onClick={getProductSalesInDatePeriod}
                />
            </div>

            {loading && <ShotLoadingTemplate />}
            {analysReady &&
                <div className='card_container margin_top_20 display_flex flex_direction_column align_items_center'>
                    <div className='display_flex flex_flow_wrap justify_content_center full_width'>
                        <div className='card '
                            style={{
                                height: '100px',
                            }}
                        >
                            <span className='bold'>{t('theAmountOfSales')}</span>
                            <span>{totalSold}</span>
                        </div>
                        <div className='card '
                            style={{
                                height: '100px',
                            }}
                        >
                            <span className='bold'>{t('theAmountOfMoneySold')}</span>
                            <span>{totalAmount}  <sup>{t('af')}</sup></span>
                        </div>
                    </div>
                    <div className='card card_user_analyse '>
                        <span className='bold'>{t('mostPurchased')}</span>
                        <div className='display_flex flex_direction_column justify_content_center full_width align_items_center'>
                            <div className='text_align_center'>
                                <DisplayLogo imgURL={topBuier?.imageUrl} alt={'image'} />
                                <div className='bold'>
                                    <span> {topBuier?.customer?.name} </span>
                                    <span> {topBuier?.customer?.lastName} </span>
                                </div>
                            </div>
                            <table className=' margin_top_20' style={{ width: '50%', alignSelf: 'flex-start' }}>
                                <tbody>
                                    <tr >
                                        <td className='bold'> {t('total')}: </td>
                                        <td> {topBuier?.totalElement} </td>
                                    </tr>
                                    <tr >
                                        <td className='bold'> {t('totalAll')}: </td>
                                        <td> {topBuier?.totalAmount} <sup>{t('af')}</sup></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default ProductSales