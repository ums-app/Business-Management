import React from 'react'
import "./productCard.css"
import { useNavigate } from 'react-router-dom'
import { t } from 'i18next'
import ReviewStars from '../../UI/ReviewStars/ReviewStars'
import { useStateValue } from '../../../context/StateProvider'
// import RateStar from '../Rate-Star/RateStar'

const ProductCard = ({ image, id, name, price, englishName, inventory, manufacturer, customeRef }) => {
    const navigate = useNavigate()
    const [{ authentication },] = useStateValue()

    const navToProductPage = () => {
        if (authentication.userType != 'Customer' || !authentication.roles('ADMIN')) return
        navigate(id)
    }


    return (
        <section className="card entering-animation box_shadow" onClick={navToProductPage} ref={customeRef}>
            <img src={image} alt={t('product') + " " + t('name')} />
            {/* <RateStar rate={rating} size={'small'} /> */}
            <div className="product-info   ">
                <table className='full_width'>
                    <tbody >
                        <tr>
                            <td>{name}</td>
                            <td>{englishName}</td>
                        </tr>
                        {authentication.userType != 'Customer' ? <>
                            <tr className='after-discount margin_bottom_5'>
                                <td className='bullet'><span className='bullet'>{t('price')} </span></td>
                                <td>{price}  <sup>af</sup></td>
                            </tr>
                            <tr className='after-discount margin_bottom_5'>
                                <td className='bullet'><span className='bullet'>{t('inventory')}</span> </td>
                                <td> {inventory}</td>
                            </tr>
                        </>
                            :
                            <>
                                <tr className='after-discount margin_bottom_5'>
                                    <td ><span className='bullet'>{t('manufacturer')} </span></td>
                                    <td>{manufacturer}</td>
                                </tr>
                                <tr className='after-discount margin_bottom_5'>
                                    <td ><span className='bullet'>{t('status')}</span></td>
                                    <td>{inventory > 0 ? t('present') : t('notExist')}</td>
                                </tr>
                            </>
                        }
                        <tr>
                            <td colSpan={2}><ReviewStars totalStars={5} /></td>
                        </tr>
                    </tbody>
                </table>


            </div>


        </section>
    )
}
export default ProductCard