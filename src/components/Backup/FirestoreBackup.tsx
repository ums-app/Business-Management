import React, { useState } from 'react';
import Collections from '../../constants/Collections';
import { collection, doc, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../constants/FirebaseConfig';
import JSZip from "jszip";
import { gregorianToJalali } from 'shamsi-date-converter';
import Button from '../UI/Button/Button';
import ICONS from '../../constants/Icons';
import { t } from 'i18next';
import SmallSpinner from '../UI/Loading/SmallSpinner';
import { InputGroup, FormControl, Alert } from 'react-bootstrap';
import { BiArrowToBottom } from 'react-icons/bi'; // Icon from react-icons


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
    const [uploadingStatus, setuploadingStatus] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importLoading, setImportLoading] = useState<boolean>(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

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


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        if (file) {
            setSelectedFile(file);
            setFeedbackMessage(`${t('selectedFile')}: ${file.name}`);
            setErrorMessage('');
        } else {
            setFeedbackMessage('');
            setErrorMessage('No file selected.');
        }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            setErrorMessage(t('fileUploadAlert'));
            return;
        }
        setImportLoading(true);
        setFeedbackMessage('');
        setErrorMessage('');
        const zip = new JSZip();
        try {
            const content = await zip.loadAsync(selectedFile);
            // Assuming each file in the ZIP corresponds to a collection
            let numberOfFile = Object.keys(content.files).length;
            let index = 1
            for (const filename of Object.keys(content.files)) {
                const progress = (index++ / numberOfFile) * 100;
                setuploadingStatus(`${progress.toFixed(0)}%`)
                const fileData = await content.files[filename].async("string");
                const collectionName = getCollectionNameFromFilename(filename); // Implement this function
                console.log(collectionName);
                await updateFirestoreCollection(collectionName, fileData);

            }
            setSelectedFile(null);
            setFeedbackMessage(t('uploadedSuccessfully'));
        } catch (error) {
            console.error("Error importing data from ZIP file:", error);
        } finally {
            setImportLoading(false);
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
        <div style={styles.container}>

            <h1 className='title'>{t('backup')}</h1>
            <div style={styles.container} >
                <div className="text-center display_flex align_items_center">
                    <i style={styles.icon} className={ICONS.arrowDownShort}></i>
                    <h2 style={styles.title}>{t('saveBackup')}</h2>
                </div>
                <div className='display_flex align_items_center  flex_flow_wrap justify_content_space_between   margin_right_10 margin_left_10'>
                    <ul className='list'>
                        {Object.keys(Collections).map((collectionKey) => (
                            <li className='display_flex margin_5' key={collectionKey} style={{ marginBottom: '10px' }}>
                                {loadingCollections[collectionKey] == 'loading' && <SmallSpinner visibility={true} />}
                                {loadingCollections[collectionKey] == 'done' && <i className={ICONS.thick} style={{ color: 'var(--main-color)', fontSize: '20px', margin: '0 5px' }}></i>}
                                <span>{t(Collections[collectionKey].toLowerCase())}</span>
                            </li>
                        ))}

                    </ul>
                    <div className='align_self_end'>
                        <Button
                            text={t('backupAll')}
                            onClick={handleBackupAll}
                            icon={ICONS.download}
                            btnType='align_self_end'
                        />
                    </div>
                </div>
            </div>

            <div style={styles.container}>
                <div className="text-center display_flex align_items_center">
                    <i style={styles.icon} className={ICONS.arrowUpShort}></i>
                    <h2 style={styles.title}>{t('upload')}</h2>
                </div>

                <div style={styles.inputContainer}>
                    <input
                        type="file"
                        accept=".zip"
                        onChange={handleFileChange}
                        style={styles.fileInput}
                        id="fileInput"
                    />
                    <label htmlFor="fileInput" style={styles.customFileInput}>
                        {t('addFile')}
                    </label>


                    <Button
                        onClick={handleImport}
                        style={styles.button}
                        disabled={importLoading}
                        isLock={importLoading}
                        text={importLoading ? t('uploadingData') : t('upload')}
                    >

                    </Button>
                </div>

                {importLoading && <span style={styles.loadingText}>{uploadingStatus} {t('uploadingData')}</span>}

                {feedbackMessage && <Alert variant="success" style={styles.alert}>{feedbackMessage}</Alert>}
                {errorMessage && <Alert variant="danger" style={styles.alert}>{errorMessage}</Alert>}
            </div>

        </div >
    );
};

// Enhanced styles for the component
const styles = {
    container: {
        maxWidth: '100%',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #e1e1e1',
        borderRadius: '10px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    title: {
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
    },
    icon: {
        fontSize: '40px',
        color: '#007bff',
        marginBottom: '10px',
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
    },
    fileInput: {
        display: 'none',
    },
    customFileInput: {
        display: 'inline-block',
        padding: '5px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    customFileInputHover: {
        backgroundColor: '#0056b3',
    },
    loadingText: {
        display: 'block',
        margin: '10px 0',
        fontSize: '16px',
        color: '#007bff',
        fontWeight: 'bold',
    },
    button: {
        padding: '10px 20px',
        fontWeight: 'bold',
    },
    alert: {
        marginTop: '20px',
    },
};



export default BackupComponent;


