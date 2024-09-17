import { getDownloadURL, ref } from 'firebase/storage';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Folders from '../../../../constants/Folders';
import { storage } from '../../../../constants/FirebaseConfig';

function ProductInformation({ product }) {
    const { productId } = useParams();
    const [productImage, setproductImage] = useState();
    useEffect(() => {
        getProductImage(productId)
    })


    const getProductImage = async (productId) => {
        const imageRef = ref(storage, Folders.ProductImages(productId));  // Adjust the path to your image
        // Fetch the download URL
        getDownloadURL(imageRef)
            .then(url => setproductImage(url))
    }


    return (
        <div className='display_flex'>
            {/* User Profile Image */}
            <div className="user_profile_img display_flex align_items_center flex_direction_column">
                <img
                    src={productImage}
                    alt="user img"
                    width={300}
                    height={350}
                />
                <h1>
                    {product?.name}{" "}
                </h1>
            </div>
        </div>
    )
}

export default ProductInformation