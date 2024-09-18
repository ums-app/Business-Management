import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Folders from '../../../../constants/Folders';
import { db, storage } from '../../../../constants/FirebaseConfig';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate';
import { doc, getDoc } from 'firebase/firestore';
import Collections from '../../../../constants/Collections';
import { t } from 'i18next';
import "../../Products.css"

function ProductInformation({ data }) {
    const { productId } = useParams();
    const [productImage, setproductImage] = useState();
    const [product, setproduct] = useState()
    useEffect(() => {

        getProductImage(productId)
    })

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



    const getProductImage = async (productId) => {
        const imageRef = ref(storage, Folders.ProductImages(productId));  // Adjust the path to your image
        // Fetch the download URL
        getDownloadURL(imageRef)
            .then(url => setproductImage(url))
    }

    if (!data) {
        return (
            <LoadingTemplateContainer>
                <ShotLoadingTemplate />
            </LoadingTemplateContainer>
        )
    }

    console.log(data);


    return (
        <div className='product_information display_flex justify_content_space_around flex_flow_wrap margin_top_20'>
            {/* User Profile Image */}
            <div
                className="product_img display_flex align_items_center border_radius_6 border_1px_solid flex_direction_column">
                {productImage ? <img
                    src={productImage}
                    alt={t('image') + " " + t('product')}
                    width={340}
                    height={300}
                /> : <ShotLoadingTemplate style={{ height: '100%' }} />
                }
            </div>
            <div className='display_flex flex_flow_wrap justify_content_center'
                style={{ alignContent: ' flex-start' }}
            >
                {Object.keys(data).map(key => {
                    return <div
                        style={{ height: '80px', width: '200px' }}
                        className='border_1px_solid margin_10 padding_10 border_radius_8 display_flex flex_direction_column align_items_center'>
                        <span className='bold margin_bottom_10'>{t(key)}</span>
                        <span>{data[key]}</span>
                    </div>
                })}
            </div>
        </div>
    )
}

export default ProductInformation