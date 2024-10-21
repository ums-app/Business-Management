import React, { useEffect, useState } from 'react'
import LoadingTemplateContainer from '../../UI/LoadingTemplate/LoadingTemplateContainer';
import HeadingLoadingTemplate from '../../UI/LoadingTemplate/HeadingLoadingTemplate';
import { getAllLogs } from '../../../Utils/FirebaseTools';
import { Log } from '../../../Types/Types';
import { t } from 'i18next';
import { convertToJalali } from '../../../Utils/DateTimeUtils';
import { jalaliToGregorian } from 'shamsi-date-converter';
import CustomDatePicker from '../../UI/DatePicker/CustomDatePicker';
import Button from '../../UI/Button/Button';
import { collection, DocumentData, endBefore, getCountFromServer, getDocs, limit, limitToLast, orderBy, query, QueryConstraint, startAfter, where } from 'firebase/firestore';
import { mapDocToLog } from '../../../Utils/Mapper';
import { pageSizes } from '../../../constants/Others';
import { db } from '../../../constants/FirebaseConfig';
import Collections from '../../../constants/Collections';
import Pagination from '../../UI/Pagination/Pagination';
import { Tooltip } from 'react-tooltip';

const AllLogs: React.FC = () => {
    const [loading, setloading] = useState<boolean>(true)
    const [logs, setlogs] = useState<Log[]>([]);
    const [filtered, setFiltered] = useState<Log[]>([])
    const [range, setrange] = useState<Date[]>([])
    const [pageSize, setPageSize] = useState<number>(pageSizes[0])
    const [totalPages, setTotalPages] = useState<number>()
    const [totalDocuments, setTotalDocuments] = useState<number>(0); // Total number of documents
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
    const [firstVisible, setFirstVisible] = useState<DocumentData | null>(null);
    const [isPrevPageAvailable, setIsPrevPageAvailable] = useState<boolean>(false); // To disable/enable previous page button
    const logCollectionRef = collection(db, Collections.Logs);

    useEffect(() => {
        getAllLogs()
            .then(res => {
                setlogs(res)
                setFiltered(res)
            })
            .finally(() => setloading(false))
    }, [])


    useEffect(() => {
        getTotalDocumentCount(pageSizes[0]);
    }, []);



    const getProductSalesInDatePeriod = async () => {
        const dates: Date[] = range.map(item => new Date(jalaliToGregorian(item.year, item.month.number, item.day).join('/')))
        let consumps: Log[] = logs;
        console.log(dates);

        if (range.length == 1) {
            console.log(range);

            consumps = consumps.filter(item => {
                const elementDate = item.date.toDate(); // Convert Firebase Timestamp to JS Date

                // Create a range for the entire day, accounting for time (start of day to end of day)
                const startOfDay = new Date(dates[0].setHours(0, 0, 0, 0));  // Start of the day (00:00:00)
                const endOfDay = new Date(dates[0].setHours(23, 59, 59, 999)); // End of the day (23:59:59)

                // Check if the element's date falls within the entire day
                return elementDate >= startOfDay && elementDate <= endOfDay;
            });
        }


        if (range.length >= 2) {
            console.log(range);
            const startDay = new Date(dates[0].setHours(0, 0, 0, 0));
            const endDay = new Date(dates[1].setHours(23, 59, 59, 999));

            consumps = consumps.filter(item => {
                console.log(item.createdDate.toDate());


                const elementDate = item.createdDate.toDate(); // Convert Firebase Timestamp to JS Date
                return elementDate >= startDay && elementDate <= endDay;
            })
        }

        setFiltered(consumps)

    }




    // Function to get the documents based on search values (indexNumber or customer name)
    const getDocsBySearchValue = async () => {
        setloading(true);

        try {
            // Dynamically build the query based on search conditions
            let queryConstraints: QueryConstraint[] = [orderBy("createdDate", "desc"), limit(pageSize)];


            const firstPageQuery = query(logCollectionRef, ...queryConstraints);

            const querySnapshot = await getDocs(firstPageQuery);

            if (querySnapshot.empty) {
                console.log('No documents found.');
                setlogs([]);
                setloading(false);
                return;
            }

            const customerData = querySnapshot.docs.map(doc => mapDocToLog(doc));
            setlogs(customerData);

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

    // Get the total number of documents in the collection
    const getTotalDocumentCount = async (pageSize: number) => {
        const snapshot = await getCountFromServer(logCollectionRef);
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

    // Function to get the first page of documents with optional search filters
    const getFirstPage = async (pageSize: number) => {
        setloading(true);

        try {
            // Build query constraints dynamically
            let queryConstraints: QueryConstraint[] =
                [orderBy("createdDate", "asc"), limit(pageSize)];


            // // Add search filter by 'customer.name' if present
            // if (searchValueName.length > 0) {
            //     queryConstraints.unshift(where('customer.name', '==', searchValueName));
            // }

            // Construct the final query with dynamic constraints
            const firstPageQuery = query(logCollectionRef, ...queryConstraints);

            const querySnapshot = await getDocs(firstPageQuery);

            if (querySnapshot.empty) {
                console.log('No documents found.');
                setlogs([]);
                setloading(false);
                return;
            }

            const customerData = querySnapshot.docs.map(doc => mapDocToLog(doc));

            setlogs(customerData);

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
            let queryConstraints: QueryConstraint[] = [
                orderBy("createdDate", "asc"),
                startAfter(lastVisible),
                limit(pageSize)
            ];

            // Construct the next page query with dynamic constraints
            const nextPageQuery = query(logCollectionRef, ...queryConstraints);

            const querySnapshot = await getDocs(nextPageQuery);

            if (!querySnapshot.empty) {
                const customerData = querySnapshot.docs.map(doc => mapDocToLog(doc));

                setlogs(customerData);

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
            let queryConstraints: QueryConstraint[] = [
                orderBy("createdDate", "asc"),
                endBefore(firstVisible),
                limitToLast(pageSize)
            ];


            // Construct the previous page query with dynamic constraints
            const prevPageQuery = query(logCollectionRef, ...queryConstraints);

            const querySnapshot = await getDocs(prevPageQuery);

            if (!querySnapshot.empty) {
                const customerData = querySnapshot.docs.map(doc => mapDocToLog(doc));

                setlogs(customerData);

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



    return (
        <div className=''>
            <div className='display_flex justify_content_center align_items_center full_width margin_top_20 margin_bottom_10'>
                {/* <span>{t('chooseDatePeriod')}: </span> */}
                <CustomDatePicker
                    range
                    onChange={(e: any) => setrange(e)}
                    placeholder={t('chooseDatePeriod')}
                />
                <Button
                    text={t('apply')}
                    onClick={getProductSalesInDatePeriod}
                />
            </div>


            <div className='search_pagination display_flex flex_flow_wrap justify_content_space_between input align_items_center'>
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
            <div className='display_flex justify_content_center full_width overflow_x_scroll'>
                {loading ?
                    <LoadingTemplateContainer>
                        <HeadingLoadingTemplate />
                        <HeadingLoadingTemplate />
                        <HeadingLoadingTemplate />
                        <HeadingLoadingTemplate />
                        <HeadingLoadingTemplate />
                        <HeadingLoadingTemplate />
                        <HeadingLoadingTemplate />
                        <HeadingLoadingTemplate />
                        <HeadingLoadingTemplate />
                    </LoadingTemplateContainer>
                    :
                    <table className='custom_table margin_auto'>
                        <thead>
                            <tr><th colSpan={5}>{t('dailyEvents')}</th></tr>
                            <tr>
                                <th>#</th>
                                <th>{t('title')}</th>
                                <th>{t('message')}</th>
                                <th>{t('registrar')}</th>
                                <th>{t('date')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((item, index) => {
                                console.log(item);

                                return <tr>
                                    <td>{index + 1}</td>
                                    <td>{item.title}</td>
                                    <td>{item.message}</td>
                                    <td>{item.registrar}</td>
                                    <td>
                                        <span className='bullet'>
                                            {convertToJalali(item.createdDate)}
                                        </span>
                                    </td>
                                </tr>
                            })}
                        </tbody>
                    </table>
                }

            </div>
        </div>
    )
}

export default AllLogs