import React, { useEffect, useRef } from 'react'
import print from '../../../constants/PrintCssStyles';
import { actionTypes } from '../../../context/reducer';
import Button from '../../UI/Button/Button';
import { t } from 'i18next';
import ICONS from '../../../constants/Icons';
import ReactToPrint from 'react-to-print';
import { useStateValue } from '../../../context/StateProvider';
import factorHeader from "../../../assets/img/factor_header.jpg"
import { gregorianToJalali } from 'shamsi-date-converter';
import "./FactorForPrint.css"
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import { Timestamp } from 'firebase/firestore';
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils';

function FactorForPrint({
    customerFactor,
    totalAmountOfAllFactors,
    totalAmountOfAllCustomerPayments,
    remainedAmount,
    userPayment,
    totalOfCurrent = 0 }) {

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
                className='border_1px_solkid margin_top_20'>

                {/* <h1> company name</h1> */}
                <div className='factor_header full_width display_flex'
                    style={{
                        background: `url(${factorHeader})`,
                        height: '180px',
                        backgroundPosition: 'center',
                        backgroundSize: '100% 180px',
                        backgroundRepeat: 'no-repeat'

                    }}>
                </div>
                <div className='factor_body'>
                    <div className='factor_customer_information display_flex justify_content_space_between padding_10 '>
                        <div>
                            <span>{t('invoiceOfDear')}:</span>
                            <span className='info_value'>{customerFactor?.customer?.name} {customerFactor?.customer?.lastName}</span>
                        </div>

                        <div>
                            <span>{t('date')}: </span>
                            <span className='info_values'>{formatFirebaseDates(customerFactor?.createdDate)}</span>
                        </div>
                    </div>
                    <div className='full_width products_table input'>
                        <table className='custom_table full_width'>
                            <thead>
                                <tr>
                                    <th>{t('number')}</th>
                                    <th>{t('name')}</th>
                                    <th>{t('englishName')}</th>
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
                                        <tr>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td>{item.englishName}</td>
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

                    <div className='factor_results_container full_width input margin_top_20'>
                        <h1 className='title_2 text_align_center margin_top_10 full_width'>{t('invoice')}</h1>
                        <div className='factor_results full_width margin_top_20  display_flex  '>
                            <table className='custom_table full_width'>
                                <thead>
                                    <tr>
                                        <th>{t('totalAll')} </th>
                                        <th>{t('paidAmount')} </th>
                                        <th>{t('remainedAmount')} {t('of')} {t('thisFactor')} </th>
                                        <th>{t('totalPrevRemainedAmount')}</th>
                                        <th>{t('totalRemainedAmount')} </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{totalOfCurrent()}</td>
                                        <td>{userPayment.amount}</td>
                                        <td>{remainedAmount() < 0 ? 0 : remainedAmount()}</td>
                                        <td>{(totalAmountOfAllFactors() - totalAmountOfAllCustomerPayments())}</td>
                                        <td>{(totalAmountOfAllFactors() - totalAmountOfAllCustomerPayments()) + remainedAmount()}</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>


                    <div className='factor_footer display_folex input margin_top_20 justify_content_space_between full_width margin_top_10'>
                        <div className='display_flex'>
                            <div>
                                <span className='padding_left_10 padding_right_10'> <i className={ICONS.whatsapp}></i></span>
                                <i className={ICONS.telegram}></i>
                            </div>
                            <div>
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
                                <span className='padding_left_10 padding_right_10'>
                                    افغانستان، هرات شهرنو، جاده عیدگاه، مارکت قادر هروی طبقه همکف ، پلاک 18
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default FactorForPrint