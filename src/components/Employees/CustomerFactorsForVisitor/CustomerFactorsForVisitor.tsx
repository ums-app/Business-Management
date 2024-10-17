import { collection, endBefore, getCountFromServer, getDocs, limit, limitToLast, orderBy, query, startAfter, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import Collections from '../../../constants/Collections';
import { db } from '../../../constants/FirebaseConfig';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { actionTypes } from '../../../context/reducer';
import { gregorianToJalali } from 'shamsi-date-converter';
import { useStateValue } from '../../../context/StateProvider';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import { EmployeePaymentType, pageSizes } from '../../../constants/Others';
import { Tooltip } from 'react-tooltip';
import Pagination from '../../UI/Pagination/Pagination';
import ICONS from '../../../constants/Icons';
import Button from '../../UI/Button/Button';
import HeadingLoadingTemplate from '../../UI/LoadingTemplate/HeadingLoadingTemplate';
import { mapDocToCustomerFactor } from '../../../Utils/Mapper';
import MoneyStatus from '../../UI/MoneyStatus/MoneyStatus';
import ButtonLoadingTemplate from '../../UI/LoadingTemplate/ButtonLoadingTemplate';
import { getAllEmployeePayments, getAllVisitorFactors, getCustomerPaymentByCustomerIds } from '../../../Utils/FirebaseTools';
import { CustomerFactor, EmployeePayment, ProductForSale } from '../../../Types/Types';
import { FactorType } from '../../../constants/FactorStatus';

const CustomerFactorsForVisitor: React.FC = () => {
    const nav = useNavigate();
    const [{ authentication }, dispatch] = useStateValue()
    const [allFactors, setallFactors] = useState<CustomerFactor[]>();

    const salesCollectionRef = collection(db, Collections.Sales);
    const [pageSize, setPageSize] = useState(pageSizes[0])
    const [loading, setLoading] = useState(false);
    const [searchValue, setsearchValue] = useState('');
    const [totalAmount, settotalAmount] = useState({
        totalAmountOfSalary: 0,
        totalAmountofSales: 0
    })
    const [totalShareOfEmployee, setTotalShareOfEmployee] = useState<number>(0)
    const [totalAmountOfAllFactors, setTotalAmountOfAllFactors] = useState<number>(0)
    const [totalCustomersPaid, setTotalCustomersPaid] = useState<number>(0);


    useEffect(() => {
        getAllVisitorFactors(authentication.originalEntityId)
            .then(res => {
                console.log("all factors: ", res);
                getTotalAmountOfFactors(res)
                setallFactors(res)
            })
        getAllEmployeePayments(authentication.originalEntityId)
            .then(res => {
                calculateTotals(res)
            })
    }, []);

    useEffect(() => {
        if (allFactors) {
            setLoading(true);

            // Use Array.from to ensure compatibility across all browsers (including Safari)
            const ids = Array.from(
                new Set(
                    allFactors
                        .filter(item => item.type === FactorType.STANDARD_FACTOR)
                        .map(item => item.customer.id)
                )
            );

            getCustomerPaymentByCustomerIds(ids)
                .then(res => {
                    console.log(res);
                    let total = 0;
                    res.forEach(item => total += item.amount);
                    setTotalCustomersPaid(total);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [allFactors]);


    const getTotalAmountOfFactors = (factors: CustomerFactor[]) => {
        let total = 0;
        let totalShareOfEmployee = 0
        if (factors) {
            factors.forEach(item => {
                total += item.totalAll;
                console.log("factor: ", item);
                totalShareOfEmployee += item.visitorAccount ? item?.visitorAccount?.visitorAmount : 0;
            })
        }
        // console.log('totalamount ofAllFactor: ', total);
        // console.log('total share of employee: ', totalShareOfEmployee);

        setTotalAmountOfAllFactors(total);
        setTotalShareOfEmployee(totalShareOfEmployee);

    }


    const getTotalProdcuts = (products: ProductForSale[]) => {
        let total = 0;
        products.forEach(item => {
            total += Number(item.total);
        })
        return total;
    }

    const getTotalPriceOfProdcuts = (products: ProductForSale[]) => {
        let total = 0;
        products.forEach(item => {
            total += Number(item.totalPrice);
        })
        return total;
    }

    // Function to get the documents based on search values (indexNumber or customer name)
    const getDocsBySearchValue = async () => {
        setLoading(true);

        try {
            // Dynamically build the query based on search conditions
            let queryConstraints = [orderBy("createdDate", "desc"), limit(pageSize)];

            if (searchValue.length > 0) {
                queryConstraints.unshift(where('indexNumber', '==', Number(searchValue)));
            }

            queryConstraints.unshift(where('visitorAccount.visitorId', '==', authentication.originalEntityId));

            const firstPageQuery = query(salesCollectionRef, ...queryConstraints);

            const querySnapshot = await getDocs(firstPageQuery);

            if (querySnapshot.empty) {
                console.log('No documents found.');
                setSales([]);
                setLoading(false);
                return;
            }

            const customerData = querySnapshot.docs.map(doc => mapDocToCustomerFactor(doc));

            setSales(customerData);

        } catch (error) {
            console.error('Error fetching documents: ', error);
        } finally {
            setLoading(false);
        }
    };



    const calculateTotals = (pays: EmployeePayment[]) => {
        let totalSalary = 0;
        let totalSales = 0;

        pays.forEach(pay => {
            if (pay.type == EmployeePaymentType.SALARY) {
                totalSalary += Number(pay.amount);
            } else if (pay.type == EmployeePaymentType.SALES) {
                totalSales += Number(pay.amount)
            }
        })
        settotalAmount({
            totalAmountOfSalary: totalSalary,
            totalAmountofSales: totalSales
        })
    }


    const calculateWithdrawableAmount = () => {
        // console.log('totalCusPaid:', totalCustomersPaid, ' totalshareOdEMp: ', totalShareOfEmployee, " totalAmountOfALLFac: ", totalAmountOfAllFactors)
        if (totalAmountOfAllFactors == 0) return 0
        return (totalCustomersPaid * totalShareOfEmployee) / totalAmountOfAllFactors;
    }





    if (!allFactors) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }

    return (
        <div>
            <div className='full_width input margin_bottom_10'>
                {/* <p className='title_2'>{t('status')}</p> */}
                <div>
                    <table className='custom_table full_width'>
                        <thead>
                            <tr style={{ background: 'orange' }}>
                                <th colSpan={6}>{t('status')} {t('sales')}</th>
                            </tr>
                            <tr style={{ background: 'orange' }}>
                                <th>{t('total')} {t('sales')}</th>
                                <th>{t('totalAll')} {t('sales')}</th>
                                <th>{t('shareOfSales')}</th>
                                <th>{t('payments')} {t('customers')} </th>
                                <th>{t('withdrawableAmount')}</th>
                                <th>{t('remainedAmountOfCustomers')}</th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr>
                                <td>{allFactors.length}</td>
                                <td>{totalAmountOfAllFactors.toFixed(2)}</td>
                                <td>{totalShareOfEmployee.toFixed(2)}</td>
                                <td>
                                    {loading ? <ButtonLoadingTemplate /> :
                                        totalCustomersPaid.toFixed(2)}
                                </td>
                                <td>
                                    {Math.abs(calculateWithdrawableAmount() - totalAmount.totalAmountofSales).toFixed(2)}
                                    <MoneyStatus number={calculateWithdrawableAmount() - totalAmount.totalAmountofSales > 0 ? -1 : calculateWithdrawableAmount() - totalAmount.totalAmountofSales == 0 ? 0 : 1} />
                                </td>
                                <td>
                                    {loading ? <ButtonLoadingTemplate /> :
                                        <>
                                            {Math.abs(totalAmountOfAllFactors - totalCustomersPaid).toFixed(2)}
                                            <MoneyStatus number={totalAmountOfAllFactors - totalCustomersPaid} />
                                        </>}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* <div className='full_width input'></div> */}
            <h1 className='margin_10 title'>{t('factors')}</h1>
            <div className='table_container margin_top_10'>
                <div className='search_pagination display_flex flex_flow_wrap justify_content_space_between input align_items_center'>
                    <div className='search_bar display_flex'>
                        <div className='position_relative'>
                            <input type="text" placeholder={t('indexNumber')} onChange={e => setsearchValue(e.target.value)} id='searchBox' />
                            <Tooltip
                                anchorSelect="#searchBox"
                                place="top"
                                className="toolTip_style"
                            >
                                {t("enterValueForSearchingIndexNumber")}
                            </Tooltip>
                        </div>
                        <Button text={t('search')} icon={ICONS.search} onClick={getDocsBySearchValue} />


                    </div>
                </div>
                {loading ? <HeadingLoadingTemplate /> :
                    <table className="full_width custom_table table_row_hover">
                        <thead >
                            <tr>
                                <th>{t('number')}</th>
                                <th>{t('indexNumber')}</th>
                                <th>{t('name')}</th>
                                <th>{t('lastName')}</th>
                                <th>{t('createdDate')}</th>
                                <th>{t('totalElements')}</th>
                                <th>{t('totalPrice')}</th>
                                <th>{t('paidAmount')}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {allFactors?.map((factor, index) => {
                                console.log(factor.createdDate);
                                return <tr
                                    className=" cursor_pointer hover"
                                    onClick={() => {
                                        dispatch({
                                            type: actionTypes.SET_FACTOR,
                                            payload: factor
                                        })
                                        nav('/customer-factors/print')
                                    }}
                                    key={factor.id}
                                >
                                    <td>{index + 1}</td>
                                    <td>{factor.indexNumber}</td>
                                    <td>{factor?.customer?.name}</td>
                                    <td>{factor?.customer?.lastName}</td>
                                    <td>{factor.createdDate && gregorianToJalali(new Date(factor?.createdDate?.toDate())).join('/')} </td>
                                    <td>{getTotalProdcuts(factor?.productsInFactor)}</td>
                                    <td>{getTotalPriceOfProdcuts(factor?.productsInFactor)}</td>
                                    <td>{factor?.paidAmount}</td>
                                </tr>
                            })
                            }
                            {allFactors.length == 0 && <tr><td colSpan={8}>{t('notExist')}</td></tr>}
                        </tbody>
                    </table>}
            </div>
        </div>
    )
}

export default CustomerFactorsForVisitor