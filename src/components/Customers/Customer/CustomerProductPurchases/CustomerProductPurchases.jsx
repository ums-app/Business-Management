import { collection, endBefore, getCountFromServer, getDocs, limit, limitToLast, orderBy, query, startAfter, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import Collections from '../../../../constants/Collections';
import { db } from '../../../../constants/FirebaseConfig';
import { useNavigate, useParams } from 'react-router-dom';
import { t } from 'i18next';
import { actionTypes } from '../../../../context/reducer';
import ICONS from '../../../../constants/Icons';
import { gregorianToJalali } from 'shamsi-date-converter';
import { useStateValue } from '../../../../context/StateProvider';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate';
import { pageSizes } from '../../../../constants/Others';
import { Tooltip } from 'react-tooltip';
import Pagination from '../../../UI/Pagination/Pagination';

function CustomerProductPurchases() {
    const { customerId } = useParams();
    const nav = useNavigate();
    const [, dispatch] = useStateValue()
    const [sales, setSales] = useState();
    const salesCollectionRef = collection(db, Collections.Sales);

    const [pageSize, setPageSize] = useState(pageSizes[0])
    const [totalPages, setTotalPages] = useState()
    const [totalDocuments, setTotalDocuments] = useState(0); // Total number of documents
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const [lastVisible, setLastVisible] = useState(null);
    const [firstVisible, setFirstVisible] = useState(null);
    const [isPrevPageAvailable, setIsPrevPageAvailable] = useState(false); // To disable/enable previous page button
    const [loading, setLoading] = useState(false);


    useEffect(() => {

        getTotalDocumentCount(pageSizes[0]);

    }, []);


    console.log(sales);


    const getTotalProdcuts = (products) => {
        let total = 0;
        products.forEach(item => {
            total += Number(item.total);
        })
        return total;
    }

    const getTotalPriceOfProdcuts = (products) => {
        let total = 0;
        products.forEach(item => {
            total += Number(item.totalPrice);
        })
        return total;
    }

    const getTotalPaidAmount = (payments) => {
        let total = 0;
        payments.forEach(item => {
            total += Number(item.amount);
        })
        return total;
    }

    // Function to get the total document count based on the customer ID
    const getTotalDocumentCount = async (pageSize) => {
        setLoading(true);

        try {
            // Apply the 'where' condition to count only the relevant documents
            const countQuery = query(
                salesCollectionRef,
                where('customer.id', '==', customerId)
            );

            // Get the count of matching documents
            const snapshot = await getCountFromServer(countQuery);
            const totalDocs = snapshot.data().count;
            setTotalDocuments(totalDocs);

            console.log('Total documents for customer: ', totalDocs);

            // Calculate the total number of pages based on the pageSize
            const totalPageCount = Math.ceil(totalDocs / pageSize);
            setTotalPages(totalPageCount);

            console.log('Total page count: ', totalPageCount);

            // Fetch the first page of results
            await getFirstPage(pageSize);
        } catch (error) {
            console.error('Error fetching total document count: ', error);
        } finally {
            setLoading(false);
        }
    };

    // Function to get the first page of documents
    const getFirstPage = async (pageSize) => {
        setLoading(true);

        try {
            const firstPageQuery = query(
                salesCollectionRef,
                where('customer.id', '==', customerId),
                orderBy('createdDate', 'desc'), // Adjust order as needed
                limit(pageSize)
            );

            const querySnapshot = await getDocs(firstPageQuery);

            if (querySnapshot.empty) {
                console.log('No documents found.');
                setSales([]);
                return;
            }

            const customerData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setSales(customerData);

            // Set pagination boundaries
            setFirstVisible(querySnapshot.docs[0]);
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setIsPrevPageAvailable(false); // No previous page on the first load
            setCurrentPage(1);

            console.log('First page of data loaded successfully');
        } catch (error) {
            console.error('Error fetching the first page: ', error);
        } finally {
            setLoading(false);
        }
    };


    // Function to get the next page
    const getNextPage = async () => {
        if (!lastVisible) return; // No more pages
        setLoading(true)

        const nextPageQuery = query(
            salesCollectionRef,
            where('customer.id', '==', customerId),
            orderBy('createdDate', 'desc'),
            startAfter(lastVisible),
            limit(pageSize)
        );
        const querySnapshot = await getDocs(nextPageQuery);

        if (!querySnapshot.empty) {
            const customerData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setSales(customerData);

            // Set pagination boundaries
            setFirstVisible(querySnapshot.docs[0]);
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setIsPrevPageAvailable(true); // Previous page becomes available once you move forward
            setCurrentPage((prev) => prev + 1)
        }
        setLoading(false)
    };


    // Function to get the previous page
    const getPreviousPage = async () => {
        if (!firstVisible) return; // No previous pages
        setLoading(true)
        const prevPageQuery = query(
            salesCollectionRef,
            where('customer.id', '==', customerId),
            orderBy('createdDate', 'desc'),
            endBefore(firstVisible),
            limitToLast(pageSize)
        );
        const querySnapshot = await getDocs(prevPageQuery);

        if (!querySnapshot.empty) {
            const customerData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setSales(customerData);

            // Set pagination boundaries
            setFirstVisible(querySnapshot.docs[0]);
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

            // Disable previous page button if we're on the first page again
            setIsPrevPageAvailable(querySnapshot.docs.length === pageSize);
            setCurrentPage((prev) => prev - 1)
        }
        setLoading(false)
    };















    if (!sales) {
        return <LoadingTemplateContainer>
            <ShotLoadingTemplate />
        </LoadingTemplateContainer>
    }

    console.log(totalPages);


    return (
        <div>
            <div className='full_width input'></div>


            <div className='table_container '>
                <div className='search_pagination display_flex flex_flow_wrap justify_content_space_between input align_items_center'>
                    <div className='pagination display_flex '>
                        <div className='display_flex align_items_center '>
                            <label htmlFor="pageSize">{t('size')}</label>
                            <select
                                name="pageSize"
                                id="pageSize"
                                className='input margin_left_10 margin_right_10'
                                onChange={e => {
                                    setPageSize(e.target.value)
                                    getTotalDocumentCount(e.target.value)
                                }}
                            >
                                {pageSizes.map(num => {
                                    return <option value={num} key={num}>{num}</option>
                                })}
                            </select>
                            <Tooltip
                                anchorSelect="#pageSize"
                                place="top"
                                className="toolTip_style"
                            >
                                {t("numberOfElementPerPage")}
                            </Tooltip>
                        </div>
                        <Pagination
                            total={totalPages}
                            currentPage={currentPage}
                            nextPage={getNextPage}
                            prevPage={getPreviousPage}
                            isPrevPageAvailable={isPrevPageAvailable}
                        />
                    </div>
                </div>
                <table className="full_width custom_table table_row_hover">
                    <thead >
                        <tr>
                            <th>{t('number')}</th>
                            <th>{t('name')}</th>
                            <th>{t('lastName')}</th>
                            <th>{t('createdDate')}</th>
                            <th>{t('totalElements')}</th>
                            <th>{t('totalPrice')}</th>
                            <th>{t('paidAmount')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales?.map((factor, index) => {
                            console.log(factor.createdDate);
                            return <tr
                                className=" cursor_pointer hover"
                                onClick={() => {
                                    dispatch({
                                        type: actionTypes.SET_FACTOR,
                                        payload: factor
                                    })
                                    dispatch({
                                        type: actionTypes.ADD_CUSTOMER_TO_SALE_FACTOR,
                                        payload: factor.customer
                                    })
                                    nav('/sales/' + factor.id)
                                }}
                                key={factor.id}
                            >
                                <td>{index + 1}</td>
                                <td>{factor?.customer?.name}</td>
                                <td>{factor?.customer?.lastName}</td>
                                <td>{factor.createdDate && gregorianToJalali(new Date(factor?.createdDate.toDate())).join('/')} </td>
                                <td>{getTotalProdcuts(factor?.productsInFactor)}</td>
                                <td>{getTotalPriceOfProdcuts(factor?.productsInFactor)}</td>
                                <td>{getTotalPaidAmount(factor?.payments)}</td>

                            </tr>
                        })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CustomerProductPurchases