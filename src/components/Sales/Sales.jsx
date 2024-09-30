import React, { useEffect, useRef, useState } from 'react'
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
import Modal from '../UI/modal/Modal';
import SelectCustomer from './AddSaleFactor/SelectCustomer/SelectCustomer';
import { gregorianToJalali } from 'shamsi-date-converter';
import { actionTypes } from '../../context/reducer';
import { useStateValue } from '../../context/StateProvider';
import { Tooltip } from 'react-tooltip';
import Pagination from '../UI/Pagination/Pagination';
import { pageSizes } from '../../constants/Others';
import ICONS from '../../constants/Icons';
import { FactorType } from '../../constants/FactorStatus';



function Sales() {
    const nav = useNavigate();
    const [, dispatch] = useStateValue()
    const [sales, setSales] = useState();
    const salesCollectionRef = collection(db, Collections.Sales);
    const [showSelectCustomerModal, setShowSelectCustomerModal] = useState(false)

    const [factors, setFactors] = useState()

    const [pageSize, setPageSize] = useState(pageSizes[0])
    const [totalPages, setTotalPages] = useState()
    const [totalDocuments, setTotalDocuments] = useState(0); // Total number of documents
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const [lastVisible, setLastVisible] = useState(null);
    const [firstVisible, setFirstVisible] = useState(null);
    const [isPrevPageAvailable, setIsPrevPageAvailable] = useState(false); // To disable/enable previous page button
    const [searchValue, setsearchValue] = useState('');
    const [searchValueName, setsearchValueName] = useState('')
    const [loading, setloading] = useState(false);


    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);


    useEffect(() => {
        getTotalDocumentCount(pageSizes[0]);
    }, []);

    // Handler for input change
    const handleInputChange = async (e) => {

        const value = e.target.value;
        setInputValue(value);

        if (value.trim().length === 0) {
            getFirstPage();
            setSuggestions([]);
            return;
        }

        console.log(value);

        // Firestore query to search by name or lastname
        const q = query(
            collection(db, Collections.Sales),
            where('customer.name', '>=', value),
            where('customer.name', '<=', value + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);
        const fetchedSuggestions = new Map();


        querySnapshot.forEach((doc) => {
            const customerData = doc.data();
            console.log(customerData);
            fetchedSuggestions.set(
                `${customerData.customer.name} ${customerData.customer.lastName}`,
                { name: customerData.customer.name, lastName: customerData.customer.lastName }
            )
        });

        console.log(fetchedSuggestions.values());

        setSuggestions([...fetchedSuggestions.values()]);
    };

    const findByNameAndLastName = async (name, lastName) => {
        setloading(true)
        console.log(name, lastName);
        setInputValue(name + " " + lastName)

        // Firestore query to search by name or lastname
        const q = query(
            collection(db, Collections.Sales),
            where('customer.name', '==', name),
            where('customer.lastName', '==', lastName)
        );

        try {
            const querySnapshot = await getDocs(q);
            const customerData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            console.log(customerData);

            setFactors(customerData)
            setSuggestions([]);
        } catch (err) {
            console.log(err);
        } finally {
            setloading(false)
        }
    };



    // Get the total number of documents in the collection
    const getTotalDocumentCount = async (pageSize) => {
        const snapshot = await getCountFromServer(salesCollectionRef);
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


    // Function to get the documents based on search values (indexNumber or customer name)
    const getDocsBySearchValue = async () => {
        setloading(true);

        try {
            // Dynamically build the query based on search conditions
            let queryConstraints = [orderBy("createdDate", "desc"), limit(pageSize)];

            if (searchValue.length > 0) {
                queryConstraints.unshift(where('indexNumber', '==', Number(searchValue)));
            }

            if (searchValueName.length > 0) {
                queryConstraints.unshift(where('customer.name', '==', searchValueName));
            }

            const firstPageQuery = query(salesCollectionRef, ...queryConstraints);

            const querySnapshot = await getDocs(firstPageQuery);

            if (querySnapshot.empty) {
                console.log('No documents found.');
                setFactors([]);
                setloading(false);
                return;
            }

            const customerData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
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
            let queryConstraints = [orderBy("createdDate", "desc"), limit(pageSize)];

            // Add search filter by 'indexNumber' if present
            if (searchValue.length > 0) {
                queryConstraints.unshift(where('indexNumber', '==', Number(searchValue)));
            }

            // // Add search filter by 'customer.name' if present
            // if (searchValueName.length > 0) {
            //     queryConstraints.unshift(where('customer.name', '==', searchValueName));
            // }

            // Construct the final query with dynamic constraints
            const firstPageQuery = query(salesCollectionRef, ...queryConstraints);

            const querySnapshot = await getDocs(firstPageQuery);

            if (querySnapshot.empty) {
                console.log('No documents found.');
                setFactors([]);
                setloading(false);
                return;
            }

            // Map the document data
            const customerData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
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
                orderBy("createdDate", "desc"),
                startAfter(lastVisible),
                limit(pageSize)
            ];

            // Add search filter by 'indexNumber' if present
            if (searchValue.length > 0) {
                queryConstraints.unshift(where('indexNumber', '==', Number(searchValue)));
            }

            // Add search filter by 'customer.name' if present
            if (searchValueName.length > 0) {
                queryConstraints.unshift(where('customer.name', '==', searchValueName));
            }

            // Construct the next page query with dynamic constraints
            const nextPageQuery = query(salesCollectionRef, ...queryConstraints);

            const querySnapshot = await getDocs(nextPageQuery);

            if (!querySnapshot.empty) {
                const customerData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
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

            // Add search filter by 'customer.name' if present
            if (searchValueName.length > 0) {
                queryConstraints.unshift(where('customer.name', '==', searchValueName));
            }

            // Construct the previous page query with dynamic constraints
            const prevPageQuery = query(salesCollectionRef, ...queryConstraints);

            const querySnapshot = await getDocs(prevPageQuery);

            if (!querySnapshot.empty) {
                const customerData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
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





    if (!factors) {
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
                text={t('add') + " " + t('factor') + " " + t('sale')}
                // onClick={() => nav("/customers")}
                onClick={() => setShowSelectCustomerModal(true)}
            />
            <Button
                text={t('add') + " " + t('sundryFactor')}
                // onClick={() => nav("/customers")}
                onClick={() => nav('add-custom')}
                type={"margin_10"}
            />
            <Modal show={showSelectCustomerModal} modalClose={() => setShowSelectCustomerModal(false)}>
                <SelectCustomer />
            </Modal>

            <h1 className='margin_10 title'>{t('sales')}</h1>


            <div className='search_pagination display_flex flex_flow_wrap justify_content_space_between input align_items_center'>
                <div className='search_bar display_flex'>
                    <div className='position_relative'>
                        <input
                            type="text"
                            placeholder={t('name')}
                            onChange={handleInputChange}
                            id='searchBoxName'
                            value={inputValue}
                        />
                        <Tooltip
                            anchorSelect="#searchBoxName"
                            place="top"
                            className="toolTip_style"
                        >
                            {t("enterValueForSearching")}
                        </Tooltip>
                        <input type="text" placeholder={t('indexNumber')} onChange={e => setsearchValue(e.target.value)} id='searchBox' />
                        <Tooltip
                            anchorSelect="#searchBox"
                            place="top"
                            className="toolTip_style"
                        >
                            {t("enterValueForSearchingIndexNumber")}
                        </Tooltip>
                        {suggestions.length > 0 && (
                            <ul className='suggestion_box'>
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        className='cursor_pointer'
                                        key={index}
                                        onClick={() => findByNameAndLastName(suggestion.name, suggestion.lastName)}
                                    >
                                        <span>{suggestion.name}</span> <span>{suggestion.lastName}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
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
            <div className='table_container '>
                {loading ? <ShotLoadingTemplate /> :
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
                                <th>{t('type')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {factors?.map((factor, index) => {
                                console.log(factor);

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
                                        if (factor.type == FactorType.SUNDRY_FACTOR) {
                                            nav('/sales/' + FactorType.SUNDRY_FACTOR + '/' + factor.id)
                                            return;
                                        }
                                        nav('/sales/' + factor.id)
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
                                    {/* <td>{getTotalPriceOfProdcuts(factor?.productsInFactor) - factor?.paidAmount}</td> */}
                                    <td>{t(factor.type)}</td>
                                </tr>
                            })
                            }
                        </tbody>
                    </table>
                }
            </div>



        </div>
    )
}

export default Sales
