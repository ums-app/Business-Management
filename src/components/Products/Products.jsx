
import React, { useEffect, useState } from 'react'
import Button from '../UI/Button/Button'
import { useNavigate } from 'react-router-dom'
import { t } from 'i18next'
import { toast } from 'react-toastify'
import { collection, getDocs } from 'firebase/firestore'
import { db, storage } from '../../constants/FirebaseConfig'
import Collections from '../../constants/Collections'
import { getDownloadURL, ref } from 'firebase/storage'
import Folders from '../../constants/Folders'
import LoadingTemplateContainer from '../UI/LoadingTemplate/LoadingTemplateContainer'
import ButtonLoadingTemplate from '../UI/LoadingTemplate/ButtonLoadingTemplate'
import HeadingMenuTemplate from '../UI/LoadingTemplate/HeadingMenuTemplate'
import ShotLoadingTemplate from '../UI/LoadingTemplate/ShotLoadingTemplate'
import ProductCard from './ProductCard/ProductCard'

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

    const getProductImage = async (productId) => {
        const imageRef = ref(storage, Folders.ProductImages(productId));  // Adjust the path to your image
        // Fetch the download URL
        return await getDownloadURL(imageRef)
    }


    if (!products || !imageUrls) {
        return (
            <LoadingTemplateContainer>
                <ButtonLoadingTemplate />
                <HeadingMenuTemplate />
                <ShotLoadingTemplate />
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
                {/* <table className="full_width custom_table table_row_hover">
                    <thead >
                        <tr>
                            <th>{t('number')}</th>
                            <th>{t('image')}</th>
                            <th>{t('name')}</th>
                            <th>{t('englishName')}</th>
                            <th>{t('manufacturer')}</th>
                            <th>{t('inventory')}</th>
                            <th>{t('price')}</th>

                        </tr>
                    </thead>
                    <tbody>
                        {products?.map((pro, index) => {
                            return <tr
                                className=" cursor_pointer hover"
                                onClick={() => nav('/products/' + pro?.id)}
                                key={pro?.id}
                            >
                                <td>{index + 1}</td>
                                <td>
                                    <img
                                        src={imageUrls[pro?.id] || 'placeholder.jpg'} // Placeholder image if the image is not loaded
                                        alt={pro.name}
                                        style={{ width: '80px', height: '100px' }} // Set image size
                                    />
                                </td>
                                <td>{pro.name}</td>
                                <td>{pro.englishName}</td>
                                <td>{pro.manufacturer} </td>
                                <td>{pro.inventory}</td>
                                <td>{pro.price}</td>

                            </tr>
                        })
                        }


                    </tbody>
                </table> */}

                {products.map(prd => {
                    return <ProductCard
                        image={imageUrls[prd?.id] || 'placeholder.jpg'}
                        id={prd.id}
                        name={prd.name}
                        price={prd.price}
                        inventory={prd.inventory}
                        englishName={prd.englishName}

                    />
                })}
            </div>





        </div>
    )
}



export default Products