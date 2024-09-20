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
import { gregorianToJalali } from 'shamsi-date-converter';

function ProductInformation({ data }) {
    const { productId } = useParams();
    const [productImage, setproductImage] = useState();
    const [product, setproduct] = useState()
    useEffect(() => {
        getProductImage(productId)
    }, [productId])

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

            <div className='personal_info display_flex flex_flow_wrap justify_content_center '>
                <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                    <span>{t('code')} </span>
                    <span>{data?.code}</span>
                </div>
                <div className='info_card  display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                    <span>{t('name')} </span>
                    <span>{data?.name}</span>
                </div>
                <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                    <span>{t('englishName')} </span>
                    <span>{data?.englishName}</span>
                </div>
                <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                    <span>{t('manufacturer')} </span>
                    <span>{data?.manufacturer}</span>
                </div>
                <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                    <span>{t('price')} </span>
                    <span>{data?.price}</span>
                </div>
                <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                    <span>{t('inventory')} </span>
                    <span>{data?.inventory}</span>
                </div>
                <div className='info_card display_flex flex_direction_column border_1px_solid padding_10 border_radius_6 margin_5'>
                    <span>{t('createdDate')} </span>
                    <span>{data?.createdDate && gregorianToJalali(data?.createdDate?.toDate()).join('/')}</span>
                </div>
            </div>
        </div>
    )
}

export default ProductInformation