import React, { useRef } from 'react'
import print from '../../../constants/PrintCssStyles';
import { actionTypes } from '../../../context/reducer';
import Button from '../../UI/Button/Button';
import { t } from 'i18next';
import ICONS from '../../../constants/Icons';
import ReactToPrint from 'react-to-print';
import { useStateValue } from '../../../context/StateProvider';
import factorHeader from "../../../assets/img/factor_header.jpg"
import "./FactorForPrint.css"
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils';
import MoneyStatus from '../../UI/MoneyStatus/MoneyStatus';

function FactorForPrint({
    customerFactor,
    totalAmountOfAllFactors,
    totalAmountOfAllCustomerPayments,
    remainedAmount,
    totalOfCurrent = () => 0 }) {

    let factorRef = useRef();
    const [, dispatch] = useStateValue()

    if (!customerFactor) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }


    return (
        <div className='factor_page'>
            <ReactToPrint
                content={() => factorRef}
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
                pageStyle={print({ pageSize: "A4", orientation: "portrait" })}
                documentTitle={t("factor for customer")}
            />


            <div ref={(value) => (factorRef = value)}
                className=' '>

                {/* <h1> company name</h1> */}
                <div className='factor_header full_width display_flex'
                    style={{
                        background: `url(${factorHeader})`,
                        height: '160px',
                        backgroundPosition: 'center',
                        backgroundSize: '100% 180px',
                        backgroundRepeat: 'no-repeat'
                    }}>
                </div>
                <div className='factor_body'>
                    <div className='factor_customer_information display_flex justify_content_space_between padding_10 '
                        style={{ fontSize: '14px' }}
                    >
                        <div>
                            <span>{t('invoiceOfDear')}:</span>
                            <span className='info_value'>{customerFactor?.customer?.name} {customerFactor?.customer?.lastName}</span>
                        </div>

                        <div>
                            <span>{t('date')}: </span>
                            <span className='info_values'>{formatFirebaseDates(customerFactor?.createdDate)}</span>
                        </div>
                        <div className='display_flex align_items_end'>
                            <span >{t('indexNumber')}:</span>
                            <span>
                                {customerFactor.indexNumber}
                            </span>
                        </div>
                    </div>
                    <div className='full_width products_table'>
                        <table className='custom_table full_width'>
                            <thead>
                                <tr style={{ height: '30px' }}>
                                    <th>{t('number')}</th>
                                    <th>{t('name')}</th>
                                    {/* <th>{t('englishName')}</th> */}
                                    <th>{t('total')}</th>
                                    <th>{t('pricePer')}</th>
                                    <th>{t('discount')}</th>
                                    {/* <th>{t('priceAfterDiscount')}</th> */}
                                    <th>{t('totalPrice')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customerFactor.productsInFactor.map((item, index) => {

                                    if (item.productId.lenght == 0) return null;
                                    return (
                                        <tr key={index} style={{ height: '20px' }}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            {/* <td>{item.englishName}</td> */}
                                            <td>{item.total}</td>
                                            <td>{item.pricePer}</td>
                                            <td>{item.discount.value}{item.discount.type == 'percent' && '%'}</td>
                                            {/* <td>item.</td> */}
                                            <td>{item.totalPrice}</td>
                                        </tr>
                                    )
                                })


                                }


                            </tbody>
                        </table>
                    </div>




                    <div className='factor_footer'>
                        {/* <div className='factor_results_container full_width  margin_top_20'> */}
                        <div className='factor_results full_width margin_top_20  display_flex  '>
                            <table className='custom_table full_width'>
                                <thead>
                                    <tr><th colSpan={5} style={{ height: '20px' }}>{t('invoice')}</th></tr>
                                    <tr>
                                        <th>{t('totalAll')} </th>
                                        <th>{t('paidAmount')} </th>
                                        <th>{t('remainedAmount')} {t('of')} {t('thisFactor')} </th>
                                        <th>{t('totalPrevRemainedAmount')}</th>
                                        <th>{t('totalRemainedAmount')} </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ height: '20px' }}>
                                        <td>{totalOfCurrent()}</td>
                                        <td>{customerFactor.paidAmount}</td>
                                        <td>{remainedAmount() < 0 ? 0 : remainedAmount().toFixed(2)}</td>
                                        <td>
                                            {Math.abs(totalAmountOfAllFactors - totalAmountOfAllCustomerPayments).toFixed(2)}
                                            <MoneyStatus number={(totalAmountOfAllFactors - totalAmountOfAllCustomerPayments)} />
                                        </td>
                                        <td>
                                            {Math.abs((totalAmountOfAllFactors - totalAmountOfAllCustomerPayments) + remainedAmount()).toFixed(2)}
                                            <MoneyStatus number={(totalAmountOfAllFactors - totalAmountOfAllCustomerPayments) + remainedAmount()} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {/* </div> */}


                        <div className=' factor_footer_container input full_width margin_top_10'>
                            <div className='display_flex'>
                                <div>
                                    <span className='padding_left_10 padding_right_10'> <i className={ICONS.whatsapp}></i></span>
                                    <i className={ICONS.telegram}></i>
                                </div>
                                <div style={{ fontSize: '14px' }}>
                                    <span className='padding_left_10 padding_right_10'>
                                        0703444444
                                    </span>-
                                    <span className='padding_left_10 padding_right_10'>
                                        0794441918
                                    </span>
                                </div>
                            </div>

                            <div className='display_flex'>
                                <div>
                                    <span className='padding_left_10 padding_right_10'> <i className={ICONS.gps}></i></span>
                                </div>
                                <div>
                                    <span className='padding_left_10 padding_right_10' style={{ fontSize: '14px' }}>
                                        افغانستان، هرات شهرنو، جاده عیدگاه، مارکت قادر هروی طبقه همکف ، پلاک 18
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default FactorForPrint