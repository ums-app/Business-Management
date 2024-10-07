import React, { useEffect, useRef } from 'react'
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

function FactorPrintForUsers({
    customerFactor,
    totalAmountOfAllFactors,
    totalAmountOfAllCustomerPayments,
    remainedAmount,
    userPayment,
    totalOfCurrent = () => 0 }) {

    let factorRef = useRef();

    const [{ authentication, factor }, dispatch] = useStateValue();


    const getTotalPriceOfFactor = () => {
        let totalPriceOfFac = 0
        factor.productsInFactor?.forEach(item => {
            totalPriceOfFac += Number(item.totalPrice)
        })

        return totalPriceOfFac;
    }

    console.log(factor);
    if (!factor) {
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
                            <span className='info_value'>{factor?.customer?.name} {factor?.customer?.lastName}</span>
                        </div>

                        <div>
                            <span>{t('date')}: </span>
                            <span className='info_values'>{formatFirebaseDates(factor?.createdDate)}</span>
                        </div>
                        <div className='display_flex align_items_center'>
                            <span className='bold'>{t('indexNumber')}:</span>
                            <span className='info_value'>
                                {factor.indexNumber}
                            </span>
                        </div>
                    </div>
                    <div className='full_width products_table'>
                        <table className='custom_table full_width'>
                            <thead>
                                <tr>
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
                                {factor.productsInFactor.map((item, index) => {

                                    if (item.productId.lenght == 0) return null;
                                    return (
                                        <tr key={index}>
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

                    {/* <div className='factor_results_container full_width  margin_top_20'> */}
                    <div className='factor_results full_width margin_top_20  display_flex  '>
                        <table className='custom_table full_width'>
                            <thead>
                                <tr><th colSpan={5}>{t('invoice')}</th></tr>
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
                                    <td>{factor.totalAll}</td>
                                    <td>{factor.paidAmount}</td>
                                    <td>{factor.currentRemainedAmount}</td>
                                    <td>
                                        {factor.previousRemainedAmount}
                                        <MoneyStatus number={factor.previousRemainedAmount} />
                                    </td>
                                    <td>
                                        {factor.totalRemainedAmount}
                                        <MoneyStatus number={factor.totalRemainedAmount} />
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                    {/* </div> */}


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

export default FactorPrintForUsers