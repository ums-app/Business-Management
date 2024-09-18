import React from 'react'
import "./productCard.css"
import { useNavigate } from 'react-router-dom'
import { t } from 'i18next'
import ReviewStars from '../../UI/ReviewStars/ReviewStars'
// import RateStar from '../Rate-Star/RateStar'

const ProductCard = ({ image, id, name, price, englishName, inventory, discount, customeRef }) => {
    const navigate = useNavigate()

    return (
        <section className="card entering-animation " onClick={() => navigate(id)} ref={customeRef}>
            {discount > 0 ? <span className='discount-value'>{discount ? discount + "% " : ""}</span> : ""}
            <img src={image} alt={t('product') + " " + t('name')} />
            {/* <RateStar rate={rating} size={'small'} /> */}
            <div className="product-info display_flex flex_direction_column align_items_center">
                <div className=' full_width display_flex justify_content_space_between'>
                    <p className='bold'>{name}</p>
                    <p className='bold'>{englishName}</p>
                </div>
                <span className='after-discount margin_bottom_10'>
                    <span className='bullet'>{t('price')}</span>
                    {price}
                    <sup>af</sup>
                </span>
                <span className='after-discount margin_bottom_10'>
                    <span className='bullet'>{t('inventory')}</span>
                    {inventory}
                </span>
                <ReviewStars totalStars={5} />
            </div>

        </section>
    )
}
export default ProductCard