
import React, { useEffect, useState } from 'react'
import Button from '../UI/Button/Button'
import { useNavigate } from 'react-router-dom'
import { t } from 'i18next'
import { toast } from 'react-toastify'
import { collection, getDocs } from 'firebase/firestore'
import { db, storage } from '../../constants/FirebaseConfig'
import Collections from '../../constants/Collections'

import LoadingTemplateContainer from '../UI/LoadingTemplate/LoadingTemplateContainer'
import ButtonLoadingTemplate from '../UI/LoadingTemplate/ButtonLoadingTemplate'
import HeadingMenuTemplate from '../UI/LoadingTemplate/HeadingMenuTemplate'
import ShotLoadingTemplate from '../UI/LoadingTemplate/ShotLoadingTemplate'
import ProductCard from './ProductCard/ProductCard'
import CardsContainerLoadingTemplate from "../UI/LoadingTemplate/CardsContainerLoadingTemplate";
import { getProductImage } from '../../Utils/FirebaseTools'

function Products() {
    const nav = useNavigate();
    const productCollectionRef = collection(db, Collections.Products);
    const [products, setProducts] = useState()
    const [imageUrls, setImageUrls] = useState()

    useEffect(() => {
        getProducts()
    }, [])

    useEffect(() => {
        const fetchImages = async () => {
            const newImageUrls = {};
            await Promise.all(
                products.map(async (product) => {
                    const url = await getProductImage(product.id);
                    newImageUrls[product.id] = url; // Store image URL by product ID
                })
            );
            setImageUrls(newImageUrls); // Update state with all image URLs
        };

        if (products) {
            fetchImages();
        }
    }, [products]);


    const getProducts = async () => {
        const querySnapshot = await getDocs(productCollectionRef);
        const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setProducts(items);
        console.log(items);
    }




    if (!products || !imageUrls) {
        return (
            <LoadingTemplateContainer>
                <ButtonLoadingTemplate />
                <HeadingMenuTemplate />
                <CardsContainerLoadingTemplate />
            </LoadingTemplateContainer>
        );
    }

    return (
        <div>
            <Button
                text={t('add') + " " + t('product')}
                onClick={() => nav('add')}
            />


            <h1 className='margin_10 title'>{t('products')}</h1>

            <div className='display_flex flex_flow_wrap justify_content_center '>
                {products.map(prd => {
                    return <ProductCard
                        image={imageUrls[prd?.id] || 'placeholder.jpg'}
                        id={prd.id}
                        name={prd.name}
                        price={prd.price}
                        inventory={prd.inventory}
                        englishName={prd.englishName}
                        key={prd.id}
                    />
                })}
            </div>





        </div>
    )
}



export default Products