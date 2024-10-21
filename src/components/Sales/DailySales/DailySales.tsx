import React, { useEffect, useState } from 'react'
import { t } from 'i18next'
import Button from '../../UI/Button/Button'
import { useNavigate } from 'react-router-dom'
import LoadingTemplateContainer from "../../UI/LoadingTemplate/LoadingTemplateContainer"
import HeadingMenuTemplate from "../../UI/LoadingTemplate/HeadingMenuTemplate"
import ShotLoadingTemplate from "../../UI/LoadingTemplate/ShotLoadingTemplate"
import ButtonLoadingTemplate from "../../UI/LoadingTemplate/ButtonLoadingTemplate"
import Modal from '../../UI/modal/Modal';
import SelectCustomer from '.././AddSaleFactor/SelectCustomer/SelectCustomer';
import { actionTypes } from '../../../context/reducer';
import { useStateValue } from '../../../context/StateProvider';
import { FactorType } from '../../../constants/FactorStatus';
import { CustomerFactor, ProductForSale } from '../../../Types/Types';
import { formatFirebaseDates } from '../../../Utils/DateTimeUtils';
import NotFound from '../../../pages/NotFound/NotFound';
import Roles from '../../../constants/Roles';
import Circle from '../../UI/Loading/Circle';
import BtnTypes from '../../../constants/BtnTypes';
import { getFactorsOfToday } from '../../../Utils/FirebaseTools'
const DailySales = () => {
    const nav = useNavigate();
    const [{ authentication }, dispatch] = useStateValue()
    const [showSelectCustomerModal, setShowSelectCustomerModal] = useState(false)
    const [factors, setFactors] = useState<CustomerFactor[]>()

    const [loading, setloading] = useState<boolean>(true);

    useEffect(() => {
        getFactorsOfToday()
            .then(res => {
                setFactors(res)
            })
            .finally(() => setloading(false))
    }, [])

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


    if (!authentication.isAuthenticated) {
        return <Circle />; // or return null; for no UI during loading
    }


    if (!authentication.roles.includes(Roles.ADMIN) && !authentication.roles.includes(Roles.SUPER_ADMIN)) {
        return <NotFound />
    }


    if (!factors) {
        return (
            <LoadingTemplateContainer>
                <div className='display_flex'>
                    <ButtonLoadingTemplate />
                    <ButtonLoadingTemplate />
                </div>
                <HeadingMenuTemplate />
                <ShotLoadingTemplate />
            </LoadingTemplateContainer>
        );
    }

    return (
        <div className='fade_in'>
            <div className='display_flex'>
                <Button
                    text={t('add') + " " + t('factor') + " " + t('sale')}
                    // onClick={() => nav("/customers")}
                    onClick={() => setShowSelectCustomerModal(true)}
                    btnType={BtnTypes.modern}
                />
                <Button
                    text={t('add') + " " + t('sundryFactor')}
                    // onClick={() => nav("/customers")}
                    onClick={() => nav('add-custom')}
                    btnType={BtnTypes.modern}
                />
            </div>
            <Modal show={showSelectCustomerModal} modalClose={() => setShowSelectCustomerModal(false)}>
                <SelectCustomer />
            </Modal>

            <h1 className='margin_10 title'>{t('sales')}</h1>


            <div className='search_pagination display_flex flex_flow_wrap justify_content_space_between input align_items_center'>
            </div>
            <div className='table_container '>
                {loading ? <ShotLoadingTemplate /> :
                    <table className="full_width custom_table table_row_hover">
                        <thead >
                            <tr>
                                <th>#</th>
                                <th>{t('indexNumber')}</th>
                                <th>{t('name')}</th>
                                <th>{t('lastName')}</th>
                                <th>{t('createdDate')}</th>
                                <th>{t('totalElements')}</th>
                                <th>{t('totalPrice')}</th>
                                <th>{t('paidAmount')}</th>
                                <th>{t('type')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {factors?.map((factor, index) => {
                                return <tr
                                    className=" cursor_pointer hover"
                                    onClick={() => {
                                        dispatch({
                                            type: actionTypes.SET_FACTOR,
                                            payload: factor
                                        });

                                        dispatch({
                                            type: actionTypes.ADD_CUSTOMER_TO_SALE_FACTOR,
                                            payload: factor.customer
                                        });
                                        if (factor.type == FactorType.SUNDRY_FACTOR) {
                                            nav('/sales/' + FactorType.SUNDRY_FACTOR + '/' + factor.id);
                                            return;
                                        }
                                        nav('/sales/' + factor.id);
                                        console.log('nav');
                                    }}
                                    key={index}
                                >
                                    <td>{index + 1}</td>
                                    <td>{factor.indexNumber}</td>
                                    <td>{factor?.customer?.name}</td>
                                    <td>{factor?.customer?.lastName}</td>
                                    <td>{formatFirebaseDates(factor.createdDate)} </td>
                                    <td>{getTotalProdcuts(factor?.productsInFactor)}</td>
                                    <td>{getTotalPriceOfProdcuts(factor?.productsInFactor)}</td>
                                    <td>{factor?.paidAmount}</td>
                                    {/* <td>{getTotalPriceOfProdcuts(factor?.productsInFactor) - factor?.paidAmount}</td> */}
                                    <td>{t(factor.type)}</td>
                                </tr>
                            })
                            }
                            {factors?.length == 0 && <tr>
                                <td colSpan={9}>{t('notExist')}</td>
                            </tr>}
                        </tbody>
                    </table>
                }
            </div>



        </div >
    )
}

export default DailySales
