import React, { MutableRefObject, useEffect, useRef, useState } from 'react'
import { getAllCustomerPayments, getAllPayments, getCustomerFactors, getCustomers, getFactors, getStandardFactors, totalAmountOfAllCustomerPayments, totalAmountOfAllFactors } from '../../../Utils/FirebaseTools.ts';
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils.js';
import { t } from 'i18next';
import { gregorianToJalali } from 'shamsi-date-converter';
import { actionTypes } from '../../../context/reducer.js';
import Button from '../../UI/Button/Button.tsx';
import print from '../../../constants/PrintCssStyles.js';
import { useStateValue } from '../../../context/StateProvider.js';
import ReactToPrint from 'react-to-print';
import ICONS from '../../../constants/Icons.js';
import "./ShortListedCustomers.css"
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer.jsx';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate.jsx';
import MoneyStatus from "../../UI/MoneyStatus/MoneyStatus.jsx"
import { CustomerFactor, CustomerForSaleFactor, CustomerPayment } from '../../../Types/Types.ts';

const filters = {
    All: 'all',
    DebtorCustomers: 'debtorCustomers',
    CreditorCustomers: 'creditorCustomers',
    Settled: 'settled'
}


interface FilteredCustomer {
    name: string,
    lastName: string,
    customerLocation: string,
    customerPhoneNumber: string,
    lastPurchaseDate: string,
    lastPurchaseAmount: number,
    lastPaymentDate: string,
    lastPaymentAmount: number,
    remainedAmount: number
}

const ShortListedCustomers: React.FC = () => {
    const [, dispatch] = useStateValue()
    const [customers, setCustomers] = useState<CustomerForSaleFactor[]>();
    const [payments, setpayments] = useState<CustomerPayment[]>([]);
    const [factors, setFactors] = useState<CustomerFactor[]>([]);
    const [shortListOfCustomers, setshortListOfCustomers] = useState<FilteredCustomer[]>([]);
    const [loading, setLoading] = useState(false)
    let shortListRef: HTMLDivElement | null = null;
    const [filter, setFilter] = useState<string>()
    useEffect(() => {
        getCustomers().then(res => {
            setCustomers(res)
        })

        getAllPayments().then(res => {
            setpayments(res)
        })

        getStandardFactors().then(res => {
            setFactors(res)
        })

    }, [])

    // console.log(customers, payments, factors);

    useEffect(() => {
        if (customers && payments && factors) {
            console.log('short list added');
            shortListTheCustomer(filters.All);
        }


    }, [customers, payments, factors])


    // console.log(shortListOfCustomers);


    const shortListTheCustomer = (filter: string) => {
        setLoading(true)
        const list: FilteredCustomer[] = [];
        customers?.map(customer => {
            const pays: CustomerPayment[] = payments.filter(item => item.customerId == customer.id);


            const facs = factors.filter(item => item?.customer.id == customer.id);

            const totalPayments = totalAmountOfAllCustomerPayments(pays);

            const totalAmountOfFactors = totalAmountOfAllFactors(facs);
            const remained = totalAmountOfFactors - totalPayments;
            // console.log('name: ', customer.name, pays);
            // console.log('name: ', customer.name + " " + customer.lastName, 'totalPayments: ', totalPayments, 'totalamountofFactors: ', totalAmountOfFactors, 'remained: ', remained);


            const customerOBJ = {
                name: customer.name,
                lastName: customer.lastName,
                customerLocation: customer.location,
                customerPhoneNumber: customer.phoneNumber,
                lastPurchaseDate: facs[0]?.createdDate ? formatFirebaseDates(facs[0]?.createdDate) : '',
                lastPurchaseAmount: totalAmountOfAllFactors([facs[0]]),
                lastPaymentDate: pays[0]?.createdDate ? formatFirebaseDates(pays[0]?.createdDate) : '',
                lastPaymentAmount: pays[0]?.amount && pays[0]?.amount,
                remainedAmount: remained
            }
            console.log(customer, customerOBJ);

            if (filter == filters.DebtorCustomers && remained > 0) {
                console.log('if ', filter + ' == ' + filters.DebtorCustomers);

                list.push(customerOBJ)
            } else if (filter == filters.CreditorCustomers && remained < 0) {
                console.log('if ', filter + ' == ' + filters.CreditorCustomers);
                list.push(customerOBJ)
            } else if (filter == filters.Settled && remained == 0) {
                console.log('if ', filter + ' == ' + filters.Settled);
                list.push(customerOBJ)
            } else if (filter == filters.All) {
                console.log('if all');
                list.push(customerOBJ)
            }
        })

        console.log(list);


        setshortListOfCustomers(list);
        setLoading(false)

    }

    if (!customers || !payments || !factors) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>

    }

    return (
        <div>
            <div className='display_flex flex_flow_wrap justify_content_space_between'>

                <ReactToPrint
                    content={() => shortListRef}
                    trigger={() => <Button text={t("print")} icon={ICONS.printer} />}
                    copyStyles={true}
                    onBeforePrint={() => {
                        dispatch({
                            type: actionTypes.SET_GLOBAL_LOADING,
                            payload: {
                                value: true,
                            },
                        });
                    }}
                    onAfterPrint={() => {
                        dispatch({
                            type: actionTypes.SET_GLOBAL_LOADING,
                            payload: {
                                value: false,
                            },
                        });
                    }}
                    pageStyle={print({ pageSize: "A4", orientation: "landscape" })}
                    documentTitle={t("customerListTitleForShortList")}
                />

                <div className='display_flex flex_flow_wrap width_max_content align_items_center'>
                    <label htmlFor="filters" className='word_break_no'>{t('listBy')}: </label>
                    <select name="filters" id=""
                        onChange={e => {
                            setFilter(e.target.value)
                            shortListTheCustomer(e.target.value);
                        }}>
                        <option value={filters.All}>{t(filters.All)}</option>
                        <option value={filters.DebtorCustomers}>{t(filters.DebtorCustomers)}</option>
                        <option value={filters.CreditorCustomers}>{t(filters.CreditorCustomers)}</option>
                        <option value={filters.Settled}>{t(filters.Settled)}</option>
                    </select>

                </div>


            </div>
            <div ref={(value) => shortListRef = value} className='customers_list'>
                <div className='full_width display_flex flex_direction_column align_items_center'>
                    <p className='title'>{t('customerListTitleForShortList')}</p>
                    <div className='bold full_width display_flex justify_content_end'>
                        <span>{t('date')}:</span>
                        <span className='info_value'>{gregorianToJalali(new Date()).join('/')}</span>
                    </div>
                </div>
                {loading ? <ShotLoadingTemplate /> :
                    <table className='custom_table full_width'>
                        <thead >
                            <tr style={{ backgroundColor: '#f744e2' }}>
                                <th rowSpan={2}>{t('number')}</th>
                                <th colSpan={2}>{t('specification')}</th>
                                <th rowSpan={2}>{t('location')}</th>
                                <th colSpan={2}>{t('lastPurchaseFactor')}</th>
                                <th rowSpan={2}>{t('phoneNumber')}</th>
                                <th colSpan={2}>{t('lastPayment')}</th>
                                <th rowSpan={2}>{t('remainedAmount')}</th>
                                <th rowSpan={2} > {t('currentAmount')}</th>
                            </tr>
                            <tr style={{ backgroundColor: '#f744e2' }}>
                                <th>{t('name')}</th>
                                <th>{t('lastName')}</th>
                                <th >{t('amount')}</th>
                                <th >{t('date')}</th>
                                <th >{t('amount')}</th>
                                <th>{t('date')}</th>
                            </tr>
                        </thead>
                        <tbody>

                            {shortListOfCustomers.map((item, index) => {
                                return (
                                    <tr style={{ height: '30px' }} key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.name}</td>
                                        <td>{item.lastName}</td>
                                        <td>{item.customerLocation}</td>
                                        <td>{item.lastPurchaseAmount}</td>
                                        <td>{item.lastPurchaseDate}</td>
                                        <td>{item.customerPhoneNumber}</td>
                                        <td>{item?.lastPaymentAmount}</td>
                                        <td>{item?.lastPaymentDate}</td>
                                        <td >
                                            {Math.abs(item.remainedAmount)}
                                            <span style={{ float: 'left' }}>
                                                <MoneyStatus number={item.remainedAmount} />
                                            </span>
                                        </td>
                                        <td></td>
                                    </tr>
                                )
                            })}

                            {shortListOfCustomers.length == 0 &&
                                <tr>
                                    <td colSpan={11}>{t('notExist')}</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                }
            </div>
        </div>
    )
}

export default ShortListedCustomers