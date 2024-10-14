import React, { useState } from 'react';
import Collections from '../../constants/Collections';
import { collection, doc, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../constants/FirebaseConfig';
import JSZip from "jszip";
import { gregorianToJalali } from 'shamsi-date-converter';
import Button from '../UI/Button/Button';
import ICONS from '../../constants/Icons';
import { t } from 'i18next';
import Spinner from '../UI/Loading/Spinner';
import SmallSpinner from '../UI/Loading/SmallSpinner';

interface BackupState {
    loading: boolean;
    completed: boolean;
}

const fetchCollectionData = async (collectionName: string) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = querySnapshot.docs.map((doc) => {
        console.log(collectionName + " : " + doc.id);
        return {
            ...doc.data(),
            id: doc.id,
        }
    });
    return JSON.stringify(data, null, 2); // Convert to JSON string with indentation
};

const BackupComponent: React.FC = () => {
    const [loadingCollections, setLoadingCollections] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [importLoading, setImportLoading] = useState(false);

    const handleBackupAll = async () => {
        const newLoadingState = { ...Collections };

        // Set all collections to loading
        Object.keys(Collections).forEach(key => {
            newLoadingState[key] = 'loading';
        });

        setLoadingCollections(newLoadingState);

        const zip = new JSZip();

        const backupPromises = Object.keys(Collections).map(async (collectionKey) => {
            try {
                const data = await fetchCollectionData(Collections[collectionKey]);
                zip.file(`${Collections[collectionKey]}.json`, data); // Add each collection's data to the zip file
            } catch (error) {
                console.error(`Failed to backup collection ${Collections[collectionKey]}`, error);
            } finally {
                newLoadingState[collectionKey] = 'done'; // Set loading to false for the current collection
                setLoadingCollections({ ...newLoadingState });
            }
        });

        await Promise.all(backupPromises); // Wait for all backups to complete

        // Generate the zip file and trigger the download
        zip.generateAsync({ type: "blob" }).then((content) => {
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup-[${gregorianToJalali(new Date()).join('/')}].zip`; // Name of the downloaded zip file
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);
            link.remove();
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImportLoading(true);
            const zip = new JSZip();
            try {
                const content = await zip.loadAsync(file);
                // Assuming each file in the ZIP corresponds to a collection
                for (const filename of Object.keys(content.files)) {
                    const fileData = await content.files[filename].async("string");
                    const collectionName = getCollectionNameFromFilename(filename); // Implement this function
                    console.log(collectionName);

                    await updateFirestoreCollection(collectionName, fileData);
                }
            } catch (error) {
                console.error("Error importing data from ZIP file:", error);
            } finally {
                setImportLoading(false);
            }
        }
    };

    const getCollectionNameFromFilename = (filename: string): string => {
        // Implement logic to map filenames to collection names
        return filename.split('.')[0]; // Assuming filename is the collection name
    };

    const updateFirestoreCollection = async (collectionName: string, data: string) => {
        const parsedData = JSON.parse(data); // Assuming the data is in JSON format
        for (const item of parsedData) {
            // Convert date fields
            if (item.createdDate) {
                item.createdDate = convertToTimestamp(item.createdDate);
            }
            if (item.joinedDate) {
                item.joinedDate = convertToTimestamp(item.joinedDate);
            }
            if (item.date) {
                item.date = convertToTimestamp(item.date);
            }
            console.log('update date: ', item);

            const docRef = doc(db, collectionName, item.id); // Use the appropriate id field
            await setDoc(docRef, item);
        }
    };

    // Helper function to convert date fields to Firestore Timestamps
    const convertToTimestamp = (date: string | { seconds: number; nanoseconds: number } | undefined) => {
        if (typeof date === "string") {
            return Timestamp.fromDate(new Date(date)); // Convert from string to Timestamp
        } else if (date instanceof Object && date !== null) {
            // Check if it's an object with seconds and nanoseconds
            if (date.seconds && date.nanoseconds) {
                return new Timestamp(date.seconds, date.nanoseconds); // Create a Timestamp from object
            }
        }
        return null; // Return null if the date is undefined or not a valid format
    };

    return (
        <div>
            <h1 className='title'>Backup Collections</h1>
            <Button
                text={t('backupAll')}
                onClick={handleBackupAll}
                icon={ICONS.download}
            />
            <ul className='list'>
                {Object.keys(Collections).map((collectionKey) => (
                    <li className='display_flex margin_5' key={collectionKey} style={{ marginBottom: '10px' }}>
                        {loadingCollections[collectionKey] == 'loading' && <SmallSpinner visibility={true} />}
                        {loadingCollections[collectionKey] == 'done' && <i className={ICONS.thick} style={{ color: 'var(--main-color)', fontSize: '20px', margin: '0 5px' }}></i>}
                        <span>{t(Collections[collectionKey].toLowerCase())}</span>
                    </li>
                ))}
            </ul>

            <h2>Import Data</h2>
            <input type="file" accept=".zip" onChange={handleFileChange} />
            {importLoading && <span>Importing data...</span>}
        </div>
    );
};

export default BackupComponent;
