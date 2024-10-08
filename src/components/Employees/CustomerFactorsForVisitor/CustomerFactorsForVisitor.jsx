import { collection, endBefore, getCountFromServer, getDocs, limit, limitToLast, orderBy, query, startAfter, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import Collections from '../../../constants/Collections';
import { db } from '../../../constants/FirebaseConfig';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { actionTypes } from '../../../context/reducer';
import { gregorianToJalali } from 'shamsi-date-converter';
import { useStateValue } from '../../../context/StateProvider';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate';
import { pageSizes } from '../../../constants/Others';
import { Tooltip } from 'react-tooltip';
import Pagination from '../../UI/Pagination/Pagination';
import ICONS from '../../../constants/Icons';
import Button from '../../UI/Button/Button';
import HeadingLoadingTemplate from '../../UI/LoadingTemplate/HeadingLoadingTemplate';
import { mapDocToCustomerFactor } from '../../../Utils/Mapper';

function CustomerFactorsForVisitor() {
    const nav = useNavigate();
    const [{ authentication }, dispatch] = useStateValue()
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
    const [searchValue, setsearchValue] = useState('');


    useEffect(() => {
        getTotalDocumentCount(pageSizes[0]);
    }, []);

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


    // Function to get the total document count based on the customer ID
    const getTotalDocumentCount = async (pageSize) => {
        setLoading(true);

        try {
            // Apply the 'where' condition to count only the relevant documents
            const countQuery = query(
                salesCollectionRef,
                where('visitorAccount.visitorId', '==', authentication.originalEntityId)
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



    // Function to get the documents based on search values (indexNumber or customer name)
    const getDocsBySearchValue = async () => {
        setLoading(true);

        try {
            // Dynamically build the query based on search conditions
            let queryConstraints = [orderBy("createdDate", "desc"), limit(pageSize)];

            if (searchValue.length > 0) {
                queryConstraints.unshift(where('indexNumber', '==', Number(searchValue)));
            }

            queryConstraints.unshift(where('visitorAccount.visitorId', '==', authentication.originalEntityId));

            const firstPageQuery = query(salesCollectionRef, ...queryConstraints);

            const querySnapshot = await getDocs(firstPageQuery);

            if (querySnapshot.empty) {
                console.log('No documents found.');
                setSales([]);
                setLoading(false);
                return;
            }

            const customerData = querySnapshot.docs.map(doc => mapDocToCustomerFactor(doc));

            setSales(customerData);

            // Set pagination boundaries
            setFirstVisible(querySnapshot.docs[0]);
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setIsPrevPageAvailable(false); // No previous page on the first load
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching documents: ', error);
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
                where('visitorAccount.visitorId', '==', authentication.originalEntityId),
                orderBy('createdDate', 'asc'), // Adjust order as needed
                limit(pageSize)
            );

            const querySnapshot = await getDocs(firstPageQuery);

            if (querySnapshot.empty) {
                console.log('No documents found.');
                setSales([]);
                return;
            }

            const customerData = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
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
            where('visitorAccount.visitorId', '==', authentication.originalEntityId),
            orderBy('createdDate', 'asc'),
            startAfter(lastVisible),
            limit(pageSize)
        );
        const querySnapshot = await getDocs(nextPageQuery);

        if (!querySnapshot.empty) {
            const customerData = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
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
            where('visitorAccount.visitorId', '==', authentication.originalEntityId),
            orderBy('createdDate', 'asc'),
            endBefore(firstVisible),
            limitToLast(pageSize)
        );
        const querySnapshot = await getDocs(prevPageQuery);

        if (!querySnapshot.empty) {
            const customerData = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
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

    return (
        <div>
            {/* <div className='full_width input'></div> */}
            <h1 className='margin_10 title'>{t('factors')}</h1>
            <div className='table_container margin_top_10'>
                <div className='search_pagination display_flex flex_flow_wrap justify_content_space_between input align_items_center'>
                    <div className='search_bar display_flex'>
                        <div className='position_relative'>
                            <input type="text" placeholder={t('indexNumber')} onChange={e => setsearchValue(e.target.value)} id='searchBox' />
                            <Tooltip
                                anchorSelect="#searchBox"
                                place="top"
                                className="toolTip_style"
                            >
                                {t("enterValueForSearchingIndexNumber")}
                            </Tooltip>
                        </div>
                        <Button text={t('search')} icon={ICONS.search} onClick={getDocsBySearchValue} />


                    </div>
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
                {loading ? <HeadingLoadingTemplate /> :
                    <table className="full_width custom_table table_row_hover">

                        <thead >
                            <tr>
                                <th>{t('number')}</th>
                                <th>{t('indexNumber')}</th>
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
                                        nav('/customer-factors/print')
                                    }}
                                    key={factor.id}
                                >
                                    <td>{index + 1}</td>
                                    <td>{factor.indexNumber}</td>
                                    <td>{factor?.customer?.name}</td>
                                    <td>{factor?.customer?.lastName}</td>
                                    <td>{factor.createdDate && gregorianToJalali(new Date(factor?.createdDate.toDate())).join('/')} </td>
                                    <td>{getTotalProdcuts(factor?.productsInFactor)}</td>
                                    <td>{getTotalPriceOfProdcuts(factor?.productsInFactor)}</td>
                                    <td>{factor?.paidAmount}</td>
                                </tr>
                            })
                            }
                            {sales.length == 0 && <tr><td colSpan={8}>{t('notExist')}</td></tr>}
                        </tbody>
                    </table>}
            </div>
        </div>
    )
}

export default CustomerFactorsForVisitor