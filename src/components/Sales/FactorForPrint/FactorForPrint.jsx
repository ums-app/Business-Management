import React, { useRef } from 'react'
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

function FactorForPrint({ customerFactor, }) {
    let factorRef = useRef();
    const [, dispatch] = useStateValue()

    console.log(customerFactor);


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
                <div className='foacor_header full_width display_flex'
                    style={{
                        background: `url(${factorHeader})`,
                        height: '180px',
                        backgroundPosition: 'center',
                        backgroundSize: '100% 180px',
                        backgroundRepeat: 'no-repeat'

                    }}>
                </div>
                <div className='factor_customer_information display_flex justify_content_space_between padding_10'>
                    <div>
                        <span>{t('invoiceOfDear')}:</span>
                        <span className='info_value'>{customerFactor?.customer?.name} {customerFactor?.customer?.lastName}</span>
                    </div>

                    <div>
                        <span>{t('date')}:</span>
                        <span className='info_values'>{customerFactor?.createdDate ? gregorianToJalali(customerFactor?.createdDate.toDate()).join('/') : '140  /  /  '} </span>
                    </div>
                </div>
                <div className='full_width'>
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

            </div>
        </div>
    )
}

export default FactorForPrint