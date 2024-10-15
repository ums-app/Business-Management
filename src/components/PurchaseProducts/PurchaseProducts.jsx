import React, { useEffect, useState } from 'react'
import { t } from 'i18next'
import Button from '../UI/Button/Button'
import { toast } from 'react-toastify'
import { db } from '../../constants/FirebaseConfig';
import { collection, endBefore, getCountFromServer, getDocs, limit, limitToLast, orderBy, query, startAfter, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'
import LoadingTemplateContainer from "../UI/LoadingTemplate/LoadingTemplateContainer"
import HeadingMenuTemplate from "../UI/LoadingTemplate/HeadingMenuTemplate"
import ShotLoadingTemplate from "../UI/LoadingTemplate/ShotLoadingTemplate"
import ButtonLoadingTemplate from "../UI/LoadingTemplate/ButtonLoadingTemplate"

import Collections from '../../constants/Collections';
import { formatFirebaseDates } from '../../Utils/DateTimeUtils';
import { useStateValue } from '../../context/StateProvider';
import { actionTypes } from '../../context/reducer';
import { pageSizes } from '../../constants/Others';
import Pagination from '../UI/Pagination/Pagination';
import { Tooltip } from 'react-tooltip';
import ICONS from '../../constants/Icons';


function PurchaseProducts() {
    const nav = useNavigate();
    const [, dispatch] = useStateValue()
    const [purchases, setPurchases] = useState();
    const [factors, setFactors] = useState()
    const purchasesCollectionRef = collection(db, Collections.Purchases);


    const [pageSize, setPageSize] = useState(pageSizes[0])
    const [totalPages, setTotalPages] = useState()
    const [totalDocuments, setTotalDocuments] = useState(0); // Total number of documents
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const [lastVisible, setLastVisible] = useState(null);
    const [firstVisible, setFirstVisible] = useState(null);
    const [isPrevPageAvailable, setIsPrevPageAvailable] = useState(false); // To disable/enable previous page button
    const [searchValue, setsearchValue] = useState('');
    const [loading, setloading] = useState(false);



    useEffect(() => {

        const fetchData = async () => {
            const querySnapshot = await getDocs(purchasesCollectionRef);
            const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setPurchases(items);
            console.log(items);
        };
        fetchData();
        getTotalDocumentCount(pageSizes[0])
    }, []);


    // Get the total number of documents in the collection
    const getTotalDocumentCount = async (pageSize) => {
        const snapshot = await getCountFromServer(purchasesCollectionRef);
        const totalDocs = snapshot.data().count;

        console.log(snapshot.data());

        console.log(pageSize);
        setTotalDocuments(totalDocs);

        // Calculate the total number of pages
        const totalPageCount = Math.ceil(totalDocs / pageSize);
        console.log(totalPageCount);

        setTotalPages(totalPageCount);
        getFirstPage(pageSize);
    };

    const handleInputSearchValue = (value) => {
        setsearchValue(value);
        // if (value.length == 0) {
        //     getDocsBySearchValue(value)
        // }

    }

    // Function to get the documents based on search values (indexNumber or customer name)
    const getDocsBySearchValue = async () => {
        setloading(true);
        console.log(searchValue);


        try {
            // Dynamically build the query based on search conditions
            let queryConstraints = [orderBy("createdDate", "desc"), limit(pageSize)];

            if (searchValue.length > 0) {
                queryConstraints.unshift(where('indexNumber', '==', Number(searchValue)));
            }

            const firstPageQuery = query(purchasesCollectionRef, ...queryConstraints);

            const querySnapshot = await getDocs(firstPageQuery);

            if (querySnapshot.empty) {
                console.log('No documents found.');
                setFactors([]);
                setloading(false);
                return;
            }

            const customerData = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            }));

            setFactors(customerData);

            // Set pagination boundaries
            setFirstVisible(querySnapshot.docs[0]);
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setIsPrevPageAvailable(false); // No previous page on the first load
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching documents: ', error);
        } finally {
            setloading(false);
        }
    };



    // Function to get the first page of documents with optional search filters
    const getFirstPage = async (pageSize) => {
        setloading(true);

        try {
            // Build query constraints dynamically
            let queryConstraints = [orderBy("createdDate", "asc"), limit(pageSize)];

            // Add search filter by 'indexNumber' if present
            if (searchValue.length > 0) {
                queryConstraints.unshift(where('indexNumber', '==', Number(searchValue)));
            }

            // Construct the final query with dynamic constraints
            const firstPageQuery = query(purchasesCollectionRef, ...queryConstraints);

            const querySnapshot = await getDocs(firstPageQuery);

            if (querySnapshot.empty) {
                console.log('No documents found.');
                setFactors([]);
                setloading(false);
                return;
            }

            const customerData = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            }));

            setFactors(customerData);

            // Set pagination boundaries
            setFirstVisible(querySnapshot.docs[0]);
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setIsPrevPageAvailable(false); // No previous page on the first load
            setCurrentPage(1);

            console.log('First page of data loaded successfully');
        } catch (error) {
            console.error('Error fetching the first page: ', error);
        } finally {
            setloading(false);
        }
    };



    // Function to get the next page of documents with optional search filters
    const getNextPage = async () => {
        if (!lastVisible) return; // No more pages to load
        setloading(true);

        try {
            // Build query constraints dynamically
            let queryConstraints = [
                orderBy("createdDate", "asc"),
                startAfter(lastVisible),
                limit(pageSize)
            ];

            // Add search filter by 'indexNumber' if present
            if (searchValue.length > 0) {
                queryConstraints.unshift(where('indexNumber', '==', Number(searchValue)));
            }


            // Construct the next page query with dynamic constraints
            const nextPageQuery = query(purchasesCollectionRef, ...queryConstraints);

            const querySnapshot = await getDocs(nextPageQuery);

            if (!querySnapshot.empty) {
                const customerData = querySnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                }));

                setFactors(customerData);

                // Set pagination boundaries
                setFirstVisible(querySnapshot.docs[0]);
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
                setIsPrevPageAvailable(true); // Previous page becomes available once you move forward
                setCurrentPage((prev) => prev + 1);
            } else {
                console.log('No more documents found.');
            }
        } catch (error) {
            console.error('Error fetching next page: ', error);
        } finally {
            setloading(false);
        }
    };


    // Function to get the previous page of documents with optional search filters
    const getPreviousPage = async () => {
        if (!firstVisible) return; // No previous pages available
        setloading(true);

        try {
            // Build query constraints dynamically
            let queryConstraints = [
                orderBy("createdDate", "desc"),
                endBefore(firstVisible),
                limitToLast(pageSize)
            ];

            // Add search filter by 'indexNumber' if present
            if (searchValue.length > 0) {
                queryConstraints.unshift(where('indexNumber', '==', Number(searchValue)));
            }

            // Construct the previous page query with dynamic constraints
            const prevPageQuery = query(purchasesCollectionRef, ...queryConstraints);

            const querySnapshot = await getDocs(prevPageQuery);

            if (!querySnapshot.empty) {
                const customerData = querySnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                }));

                setFactors(customerData);

                // Set pagination boundaries
                setFirstVisible(querySnapshot.docs[0]);
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

                // Disable the previous page button if we're on the first page again
                setIsPrevPageAvailable(querySnapshot.docs.length === pageSize);
                setCurrentPage((prev) => prev - 1);
            } else {
                console.log('No previous documents found.');
            }
        } catch (error) {
            console.error('Error fetching previous page: ', error);
        } finally {
            setloading(false);
        }
    };





    if (!purchases) {
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
                text={t('add') + " " + t('purchases')}
                onClick={() => nav("add")}
            />

            <h1 className='margin_10 title'>{t('purchases')}</h1>

            <div className='table_container '>
                <div className='search_pagination display_flex flex_flow_wrap justify_content_space_between input align_items_center'>
                    <div className='search_bar display_flex'>
                        <div className='position_relative'>
                            <input type="text" placeholder={t('indexNumber')} onChange={e => handleInputSearchValue(e.target.value)} id='searchBox' />
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
                {loading ? <ShotLoadingTemplate /> :
                    <table className="full_width custom_table table_row_hover">
                        <thead >
                            <tr>
                                <th>{t('number')}</th>
                                <th>{t('indexNumber')}</th>
                                <th>{t('createdDate')}</th>
                                <th>{t("total")} {t('package')}</th>
                                <th>{t('total')} {t('products')}</th>
                                <th>{t('totalAll')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {factors?.map((purchase, index) => {
                                return <tr
                                    className=" cursor_pointer hover"
                                    onClick={() => {
                                        dispatch({
                                            type: actionTypes.ADD_PURCHASE_FACTOR,
                                            payload: purchase
                                        })
                                        nav('/purchase-products/' + purchase.id)
                                    }}
                                    key={purchase.id}
                                >
                                    <td>{index + 1}</td>
                                    <td>{purchase.indexNumber}</td>
                                    <td>{formatFirebaseDates(purchase.createdDate)}</td>
                                    <td>{purchase.totalPackage} </td>
                                    <td>{purchase.totalProducts}</td>
                                    <td>{purchase.totalAmount}</td>
                                </tr>
                            })
                            }
                            {factors?.length == 0 && <tr>
                                <td colSpan={6}>{t('notExist')}</td>
                            </tr>}
                        </tbody>
                    </table>
                }

            </div>



        </div>
    )
}



export default PurchaseProducts

