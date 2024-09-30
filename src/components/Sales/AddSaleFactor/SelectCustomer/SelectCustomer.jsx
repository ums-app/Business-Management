
import React, { useEffect, useState } from 'react'
import "../../../Customers/Customers.css"
import { useNavigate } from 'react-router-dom'
import { t } from 'i18next'
import { collection, query, orderBy, limit, getDocs, startAfter, endBefore, limitToLast, getCountFromServer, where } from "firebase/firestore";
import { Tooltip } from 'react-tooltip'
import { db } from '../../../../constants/FirebaseConfig';
import Collections from '../../../../constants/Collections';
import { pageSizes } from '../../../../constants/Others';
import { getUserImage } from '../../../../Utils/FirebaseTools';
import LoadingTemplateContainer from '../../../UI/LoadingTemplate/LoadingTemplateContainer';
import ButtonLoadingTemplate from '../../../UI/LoadingTemplate/ButtonLoadingTemplate';
import HeadingMenuTemplate from '../../../UI/LoadingTemplate/HeadingMenuTemplate';
import ShotLoadingTemplate from '../../../UI/LoadingTemplate/ShotLoadingTemplate';
import Pagination from '../../../UI/Pagination/Pagination';
import ICONS from '../../../../constants/Icons';
import Button from '../../../UI/Button/Button';
import { actionTypes } from '../../../../context/reducer';
import { useStateValue } from '../../../../context/StateProvider';


function SelectCustomer() {
    const [, dispatch] = useStateValue();
    const nav = useNavigate();
    const customersCollectionRef = collection(db, Collections.Customers);
    const employeesCollectionRef = collection(db, Collections.Employees);
    const [pageSize, setPageSize] = useState(pageSizes[0])
    const [totalPages, setTotalPages] = useState()
    const [totalDocuments, setTotalDocuments] = useState(0); // Total number of documents
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const [customers, setCustomers] = useState();// State to hold the data and pagination state
    const [lastVisible, setLastVisible] = useState(null);
    const [firstVisible, setFirstVisible] = useState(null);
    const [isPrevPageAvailable, setIsPrevPageAvailable] = useState(false); // To disable/enable previous page button
    const [searchValue, setsearchValue] = useState('');
    const [loading, setloading] = useState(false);

    const [employees, setEmployees] = useState()
    const [imageUrls, setImageUrls] = useState()

    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        getEmployees();
        getTotalDocumentCount(pageSizes[0])

    }, []);



    useEffect(() => {
        const fetchImages = async () => {
            const newImageUrls = {};
            await Promise.all(
                customers.map(async (item) => {
                    try {
                        const url = await getUserImage(item.email);
                        newImageUrls[item.email] = url; // Store image URL by email
                    } catch (err) {

                    }
                })
            );
            setImageUrls(newImageUrls); // Update state with all image URLs
        };

        if (customers) {
            fetchImages();
        }
    }, [customers]);



    // Handler for input change
    const handleInputChange = async (e) => {

        const value = e.target.value;
        setsearchValue(value)
        setInputValue(value);

        if (value.trim().length === 0) {
            setSuggestions([]);
            return;
        }

        console.log(value);

        // Firestore query to search by name or lastname
        const q = query(
            collection(db, Collections.Customers),
            where('name', '>=', value),
            where('name', '<=', value + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);
        const fetchedSuggestions = [];

        querySnapshot.forEach((doc) => {
            const customerData = doc.data();
            console.log(customerData);
            fetchedSuggestions.push({ name: customerData.name, lastName: customerData.lastName, id: doc.id })
        });


        console.log(fetchedSuggestions);

        setSuggestions(fetchedSuggestions);
    };

    const findByNameAndLastName = async (name, lastName) => {
        setloading(true)
        setInputValue(name + " " + lastName)

        // Firestore query to search by name or lastname
        const q = query(
            collection(db, Collections.Customers),
            where('name', '==', name),
            where('lastName', '==', lastName)
        );

        try {
            const querySnapshot = await getDocs(q);
            const customerData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setCustomers(customerData)
            setSuggestions([]);
        } catch (err) {
            console.log(err);
        } finally {
            setloading(false)
        }
    };




    // Get the total number of documents in the collection
    const getTotalDocumentCount = async (pageSize) => {
        const snapshot = await getCountFromServer(customersCollectionRef);
        const totalDocs = snapshot.data().count;
        setTotalDocuments(totalDocs);

        // Calculate the total number of pages
        const totalPageCount = Math.ceil(totalDocs / pageSize);
        setTotalPages(totalPageCount);
        getFirstPage(pageSize);
    };



    // Function to get the first page
    const getDocsBySearchValue = async () => {
        setloading(true)
        const whereObj = searchValue.length > 0 ? where('name', '==', searchValue) : null;
        const firstPageQuery = query(
            customersCollectionRef,
            whereObj,
            orderBy('name'),
            limit(pageSize)
        );
        const querySnapshot = await getDocs(firstPageQuery);

        const customerData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        setCustomers(customerData);

        // Set pagination boundaries
        setFirstVisible(querySnapshot.docs[0]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setIsPrevPageAvailable(false); // No previous page on the first load
        setCurrentPage(1)
        setloading(false)
    };

    // Function to get the first page
    const getFirstPage = async (pageSize) => {
        setloading(true)
        const whereObj = searchValue.length > 0 ? where('name', '==', searchValue) : null;
        const firstPageQuery = query(
            customersCollectionRef,
            whereObj,
            orderBy('name'),
            limit(pageSize));
        const querySnapshot = await getDocs(firstPageQuery);

        const customerData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        setCustomers(customerData);

        // Set pagination boundaries
        setFirstVisible(querySnapshot.docs[0]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setIsPrevPageAvailable(false); // No previous page on the first load
        setCurrentPage(1)
        setloading(false)
    };


    // Function to get the next page
    const getNextPage = async () => {
        if (!lastVisible) return; // No more pages
        setloading(true)

        const whereObj = searchValue.length > 0 ? where('name', '==', searchValue) : null;

        const nextPageQuery = query(
            customersCollectionRef,
            whereObj,
            orderBy('name'),
            startAfter(lastVisible),
            limit(pageSize)
        );
        const querySnapshot = await getDocs(nextPageQuery);

        if (!querySnapshot.empty) {
            const customerData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setCustomers(customerData);

            // Set pagination boundaries
            setFirstVisible(querySnapshot.docs[0]);
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setIsPrevPageAvailable(true); // Previous page becomes available once you move forward
            setCurrentPage((prev) => prev + 1)
        }
        setloading(false)
    };


    // Function to get the previous page
    const getPreviousPage = async () => {
        if (!firstVisible) return; // No previous pages
        setloading(true)
        const whereObj = searchValue.length > 0 ? where('name', '==', searchValue) : null;

        const prevPageQuery = query(
            customersCollectionRef,
            whereObj,
            orderBy('name'),
            endBefore(firstVisible),
            limitToLast(pageSize)
        );
        const querySnapshot = await getDocs(prevPageQuery);

        if (!querySnapshot.empty) {
            const customerData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setCustomers(customerData);

            // Set pagination boundaries
            setFirstVisible(querySnapshot.docs[0]);
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

            // Disable previous page button if we're on the first page again
            setIsPrevPageAvailable(querySnapshot.docs.length === pageSize);
            setCurrentPage((prev) => prev - 1)
        }
        setloading(false)
    };


    const getEmployees = async () => {
        const querySnapshot = await getDocs(employeesCollectionRef);
        const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setEmployees(items);
    };

    if (!customers || !employees || !imageUrls) {
        return (
            <LoadingTemplateContainer>
                <HeadingMenuTemplate />
                <ShotLoadingTemplate />
            </LoadingTemplateContainer>
        );
    }

    return (
        <div>
            <h1 className='margin_10 title'>{ }{t('selectTheDesiredCustomer')}</h1>
            <div className='search_pagination display_flex flex_flow_wrap justify_content_space_between input align_items_center'>
                <div className='search_bar'>
                    <div className='position_relative full_width'>
                        <input type="text"
                            placeholder={t('search')}
                            value={inputValue} onChange={handleInputChange}
                            id='searchBoxSelect'
                            className='full_width'
                        />
                        {suggestions.length > 0 && (
                            <ul className='suggestion_box'>
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        className='cursor_pointer'
                                        key={index}
                                        onClick={() => findByNameAndLastName(suggestion.name, suggestion.lastName)}>{suggestion.name} {suggestion.lastName}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <Tooltip
                        anchorSelect="#searchBoxSelect"
                        place="top"
                        className="toolTip_style"
                    >
                        {t("enterValueForSearching")}
                    </Tooltip>
                    {/* <Button text={t('search')} icon={ICONS.search} onClick={getDocsBySearchValue} /> */}
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
                    <table className="full_width custom_table table_row_hover overflow_hidden">
                        <thead >
                            <tr>
                                <th>{t('number')}</th>
                                <th>{t('image')}</th>
                                <th>{t('name')}</th>
                                <th>{t('lastName')}</th>
                                <th>{t('name')} {t('organization')}</th>
                                <th>{t('phoneNumber')}</th>
                                <th>{t('location')}</th>
                                <th>{t('visitor')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers?.map((emp, index) => {

                                const visitor = employees.find(item => item.id == emp.visitor)

                                return <tr
                                    className=" cursor_pointer hover"
                                    onClick={() => {
                                        dispatch({
                                            type: actionTypes.ADD_CUSTOMER_TO_SALE_FACTOR,
                                            payload: emp
                                        })
                                        nav('add')
                                    }}
                                    key={emp.id}
                                >
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className='user_profile_img' >
                                            <img src={imageUrls[emp.email]} alt={t('user') + " " + t('image')} className='user_profile_img' />
                                        </div>
                                    </td>
                                    <td>{emp.name}</td>
                                    <td>{emp.lastName}</td>
                                    <td>{emp.organizationName} </td>
                                    <td>{emp.phoneNumber}</td>
                                    <td>{emp.location}</td>
                                    <td>{visitor?.name} {visitor?.lastName}</td>
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


export default SelectCustomer