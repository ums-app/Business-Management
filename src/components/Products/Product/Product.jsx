import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Collections from '../../../constants/Collections';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../constants/FirebaseConfig';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import CardLoadingTemplate from '../../UI/LoadingTemplate/CardLoadingTemplate';
import HeadingMenuTemplate from '../../UI/LoadingTemplate/HeadingMenuTemplate';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';

function Product() {
    const { productId } = useParams();
    const [product, setproduct] = useState()

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

    if (!product) {
        return (
            <LoadingTemplateContainer>
                <CardLoadingTemplate />
                <HeadingMenuTemplate />
                <ShotLoadingTemplate />
            </LoadingTemplateContainer>
        );
    }




    return (
        <div>
            Product:
            {product.name}
        </div>
    )
}

export default Product