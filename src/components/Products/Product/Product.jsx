import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Collections from '../../../constants/Collections';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../constants/FirebaseConfig';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import HeadingMenuTemplate from '../../UI/LoadingTemplate/HeadingMenuTemplate';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import TabMenu from '../../UI/TabMenu/TabMenu';
import Menu from '../../UI/Menu/Menu';
import Button from '../../UI/Button/Button';
import ProductInformation from "./ProductInformation/ProductInformation"
import ProductSales from './ProductSales/ProductSales';
import ProductAnalysis from './ProductAnalysis/ProductAnalysis';
import usePersistentComponent from '../../../Hooks/usePersistentComponent';
import { actionTypes } from '../../../context/reducer';
import { useStateValue } from '../../../context/StateProvider';
import { toast } from 'react-toastify';
import ICONS from '../../../constants/Icons';
import { t } from 'i18next';



const components = {
    ProductInformation: {
        componentName: "ProductInformation",
        component: ProductInformation,
    },
    ProductSales: { componentName: "ProductSales", component: ProductSales },
    ProductAnalysis: { componentName: "ProductAnalysis", component: ProductAnalysis },

};


function Product() {
    const { productId } = useParams();
    const navigate = useNavigate()
    const [product, setproduct] = useState()

    const [, dispatch] = useStateValue()
    const [displayComponent, setDisplayComponent] = usePersistentComponent(
        components,
        "ProductInformation"
    );

    useEffect(() => {

        const getProduct = async () => {
            try {
                const data = await getDoc(doc(db, Collections.Products, productId));
                if (data.exists()) {
                    setproduct(data.data())
                }
            } catch (err) {
                console.log(err);
            }
        }
        getProduct();

    }, [productId])


    // if (notFound) {
    //     return <NotFound />;
    // }

    console.log(product);

    if (!product) {
        return (
            <LoadingTemplateContainer>
                <HeadingMenuTemplate />
                <ShotLoadingTemplate />
            </LoadingTemplateContainer>
        );
    }


    const showDeleteModal = () => {
        dispatch({
            type: actionTypes.SHOW_ASKING_MODAL,
            payload: {
                show: true,
                message: "deleteMessage",
                btnAction: removeProdcut,
                id: productId,
            },
        });
    };

    const removeProdcut = async () => {
        dispatch({
            type: actionTypes.SET_GLOBAL_LOADING,
            payload: { value: true },
        });
        dispatch({
            type: actionTypes.HIDE_ASKING_MODAL,
        });
        const productDoc = doc(db, Collections.Products, productId)
        try {
            await deleteDoc(productDoc)
            navigate("/products");
            toast.success('successfullyDeleted')
        } catch (err) {
            toast.success(err.message)
        } finally {
            dispatch({
                type: actionTypes.SET_GLOBAL_LOADING,
                payload: { value: false },
            });
        }
    };


    return (
        <div>
            <section className="profile_header display_flex justify_content_space_between">
                {/* Profile Menu */}
                <Menu>
                    <Button
                        icon={ICONS.trash}
                        text={t("delete")}
                        onClick={showDeleteModal}
                    />
                    <Button
                        icon={ICONS.edit}
                        text={t("updateInformation")}
                        onClick={() =>
                            navigate("update")
                        }
                    />
                </Menu>

                {/* User Profile Image
                <div className="user_profile_img display_flex align_items_center flex_direction_column">
                    <img
                        src={productImage}
                        alt="user img"
                    />
                    <h1>
                        {product?.name}{" "}
                    </h1>
                </div> */}
            </section>


            {/* the navbar of the profile page */}

            <TabMenu>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.ProductInformation?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent(components?.ProductInformation)}
                >
                    {t("information")} {t("product")}
                </li>
                <li
                    className={
                        displayComponent?.componentName ==
                            components?.ProductSales?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent(components?.ProductSales)}
                >
                    {t('sales')}
                </li>
                {/* <li
                    className={
                        displayComponent?.componentName ==
                            components?.ProductAnalysis?.componentName
                            ? "active"
                            : ""
                    }
                    onClick={() => setDisplayComponent(components?.ProductAnalysis)}
                >
                    {t('analysis')}
                </li> */}
            </TabMenu>

            <div>
                {<displayComponent.component data={product} />}
            </div>
        </div >
    )
}

export default Product