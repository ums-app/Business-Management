import { collection, DocumentData, endBefore, getCountFromServer, getDocs, limit, limitToLast, orderBy, query, startAfter, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import Collections from '../../../constants/Collections.js';
import { useNavigate } from 'react-router-dom';
import { pageSizes } from '../../../constants/Others.js';
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer.jsx';
import ButtonLoadingTemplate from '../../UI/LoadingTemplate/ButtonLoadingTemplate.jsx';
import HeadingMenuTemplate from '../../UI/LoadingTemplate/HeadingMenuTemplate.jsx';
import ShotLoadingTemplate from '../../UI/LoadingTemplate/ShotLoadingTemplate.jsx';
import { t } from 'i18next';
import Button from '../../UI/Button/Button.tsx';
import { Tooltip } from 'react-tooltip';
import Pagination from '../../UI/Pagination/Pagination.jsx';
import { db } from '../../../constants/FirebaseConfig.js';
import { getUserImage } from '../../../Utils/FirebaseTools.ts';
import { CustomerForSaleFactor, Employee, ImageUrls, Suggestion } from '../../../Types/Types.ts';
import { mapDocToCustomer, mapDocToEmployee } from '../../../Utils/Mapper.ts';



const CustomersManagment: React.FC = () => {

    const nav = useNavigate();
    const customersCollectionRef = collection(db, Collections.Customers);
    const employeesCollectionRef = collection(db, Collections.Employees);
    const [pageSize, setPageSize] = useState(pageSizes[0])
    const [totalPages, setTotalPages] = useState<number>()
    const [totalDocuments, setTotalDocuments] = useState(0); // Total number of documents
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const [customers, setCustomers] = useState<CustomerForSaleFactor[]>([]);// State to hold the data and pagination state
    const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
    const [firstVisible, setFirstVisible] = useState<DocumentData | null>(null);
    const [isPrevPageAvailable, setIsPrevPageAvailable] = useState(false); // To disable/enable previous page button
    const [searchValue, setsearchValue] = useState('');
    const [loading, setloading] = useState(false);

    const [employees, setEmployees] = useState<Employee[]>()
    const [imageUrls, setImageUrls] = useState<ImageUrls>()


    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);


    useEffect(() => {
        getEmployees();
        getTotalDocumentCount(pageSizes[0])

    }, []);



    useEffect(() => {
        const fetchImages = async () => {
            const newImageUrls: ImageUrls = {};
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

    useEffect(() => {
        const debouncedSearch = debounce(handleInputChange, 300);
        return () => {
            debouncedSearch.cancel();
        };
    }, [inputValue]);


    const debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        const debounced = (...args: any[]) => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };

        debounced.cancel = () => {
            if (timeoutId) clearTimeout(timeoutId);
        };

        return debounced;
    };


    // Handler for input change
    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

        const value = e.target.value;
        setsearchValue(value)
        setInputValue(value);

        if (value.trim().length === 0) {
            getFirstPage(pageSizes[0]);
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
        const fetchedSuggestions: Suggestion[] = [];

        querySnapshot.forEach((doc) => {
            const customerData = doc.data();
            console.log(customerData);
            fetchedSuggestions.push({ name: customerData.name, lastName: customerData.lastName, id: doc.id })
        });


        console.log(fetchedSuggestions);

        setSuggestions(fetchedSuggestions);
    };

    const findByNameAndLastName = async (name: string, lastName: string) => {
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
            const customerData = querySnapshot.docs.map(doc => mapDocToCustomer(doc));

            setCustomers(customerData)
            setSuggestions([]);
        } catch (err) {
            console.log(err);
        } finally {
            setloading(false)
        }
    };





    // Get the total number of documents in the collection
    const getTotalDocumentCount = async (pageSize: number) => {
        const snapshot = await getCountFromServer(customersCollectionRef);
        const totalDocs = snapshot.data().count;
        setTotalDocuments(totalDocs);

        // Calculate the total number of pages
        const totalPageCount = Math.ceil(totalDocs / pageSize);
        setTotalPages(totalPageCount);
        getFirstPage(pageSize);
    };


    // Function to get the first page
    const getFirstPage = async (pageSize: number) => {
        setloading(true)

        const firstPageQuery = query(
            customersCollectionRef,
            orderBy('name'),
            limit(pageSize));
        const querySnapshot = await getDocs(firstPageQuery);

        const customerData: CustomerForSaleFactor[] = querySnapshot.docs.map(doc => mapDocToCustomer(doc));
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

        const nextPageQuery = query(
            customersCollectionRef,
            orderBy('name'),
            startAfter(lastVisible),
            limit(pageSize)
        );
        const querySnapshot = await getDocs(nextPageQuery);

        if (!querySnapshot.empty) {
            const customerData = querySnapshot.docs.map(doc => mapDocToCustomer(doc));

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

        const prevPageQuery = query(
            customersCollectionRef,
            orderBy('name'),
            endBefore(firstVisible),
            limitToLast(pageSize)
        );
        const querySnapshot = await getDocs(prevPageQuery);

        if (!querySnapshot.empty) {
            const customerData = querySnapshot.docs.map(doc => mapDocToCustomer(doc));

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
        const items = querySnapshot.docs.map((doc) => mapDocToEmployee(doc));
        setEmployees(items);
    };


    if (!customers || !employees || !imageUrls) {
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
                text={t('add') + " " + t('customer')}
                onClick={() => nav('add')}
            />


            <h1 className='margin_10 title'>{t('customers')}</h1>
            <div className='search_pagination display_flex flex_flow_wrap justify_content_space_between input align_items_center'>
                <div className='search_bar'>
                    <div className='position_relative full_width'>
                        <input type="text"
                            placeholder={t('search')}
                            value={inputValue} onChange={handleInputChange}
                            id='searchBoxSelect'
                            className='full_width'
                            autoComplete="off"
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
                                setPageSize(Number(e.target.value))
                                getTotalDocumentCount(Number(e.target.value))
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
                                <th>{t('location')}</th>
                                <th>{t('phoneNumber')}</th>
                                <th>{t('visitor')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers?.map((emp, index) => {
                                const visitor = employees.find(item => item.id == emp.visitor)
                                return <tr
                                    className=" cursor_pointer hover"
                                    onClick={() => nav('/customers/' + emp.id)}
                                    key={emp.id}
                                >
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className='user_profile_img margin_auto' >
                                            <img src={imageUrls[emp.email]} alt={t('user') + " " + t('image')} className='user_profile_img' />
                                        </div>
                                    </td>
                                    <td>{emp.name}</td>
                                    <td>{emp.lastName}</td>
                                    <td>{emp.location}</td>
                                    <td>{emp.phoneNumber}</td>
                                    <td>{visitor?.name} {visitor?.lastName}</td>
                                </tr>
                            })
                            }
                            {customers?.length == 0 && <tr>
                                <td colSpan={7}>{t('notExist')}</td>
                            </tr>}
                        </tbody>
                    </table>
                }
            </div>
        </div>
    )
}

export default CustomersManagment