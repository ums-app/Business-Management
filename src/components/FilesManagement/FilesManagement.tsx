import React, { useState, useEffect } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { db, storage } from "../../constants/FirebaseConfig";
import Collections from "../../constants/Collections";
import Folders from "../../constants/Folders";
import { ref, deleteObject, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { useDropzone } from "react-dropzone";
import "./FilesManagement.css"
import { t } from "i18next";
import Button from "../UI/Button/Button";
import ICONS from "../../constants/Icons";
import { formatFirebaseDates } from "../../Utils/DateTimeUtils";
import { mapDocToUploadedFile } from "../../Utils/Mapper";
import { getAllUploadedFile, sendLog } from "../../Utils/FirebaseTools";
import LoadingTemplateContainer from "../UI/LoadingTemplate/LoadingTemplateContainer";
import HeadingLoadingTemplate from "../UI/LoadingTemplate/HeadingLoadingTemplate";
import { useStateValue } from "../../context/StateProvider";
import { actionTypes } from "../../context/reducer";
import Roles from "../../constants/Roles";
import { useNavigate } from "react-router-dom";
import NotFound from "../../pages/NotFound/NotFound";
import Circle from "../UI/Loading/Circle";
import { Log } from "../../Types/Types";


export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    url: string;
    date: Date | Timestamp;
}

const FilesManagement: React.FC = () => {
    const [, dispatch] = useStateValue()
    // const [loading, setloading] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>();
    const [uploading, setUploading] = useState(false);
    const [showAddFile, setshowAddFile] = useState(false)
    const [progress, setProgress] = useState<number[]>([]);
    const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
    // Firestore collection reference
    const filesCollectionRef = collection(db, Collections.Files);
    const [{ authentication },] = useStateValue();
    const nav = useNavigate();

    // Fetch uploaded files from Firestore on component mount
    useEffect(() => {

        getAllUploadedFile()
            .then(res => {
                setUploadedFiles(res)
            })
            .catch(() => {
                setUploadedFiles([])
            })

    }, []);


    const onDrop = (newFiles: File[]) => {
        setAcceptedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        multiple: true, // Allow multiple files

    });

    const handleUpload = async () => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        setUploading(true); // Start loading
        const files = [...acceptedFiles]; // Create a copy of the accepted files

        // const progressArray = new Array(files.length).fill(0); // Initialize progress array

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = `${file.name}-[${new Date().getMilliseconds()}]`;

            try {
                const uploadTask = await uploadFile(file, fileName, i); // Await the upload task

                // Once the upload is complete, get the download URL
                const downloadURL = await getDownloadURL(uploadTask.ref);

                // Save file metadata including the download URL to Firestore
                const fileData = {
                    name: file.name,
                    size: file.size,
                    url: downloadURL,
                    date: new Date(),
                    descriptions: '',
                };

                const docRef = await addDoc(filesCollectionRef, fileData);

                // Fetch the document snapshot using getDoc
                const docSnap = await getDoc(docRef); // Import getDoc from Firestore

                if (docSnap.exists()) {
                    // Update uploaded files with the new file data
                    setUploadedFiles((prev) => [
                        ...prev,
                        mapDocToUploadedFile(docSnap), // Map the fetched document snapshot
                    ]);
                } else {
                    console.error('No such document!');
                }

                // Remove the file from the accepted files list after successful upload
                const updatedFiles = [...files];
                updatedFiles.splice(i, 1);
                setAcceptedFiles(updatedFiles);

            } catch (error) {
                console.error("Error uploading file:", error);
                // Handle any errors here (e.g., show toast notifications)
            }
        }

        // End loading after all files are uploaded
        setUploading(false);
        setshowAddFile(false); // Close the file upload section after completion
        const log: Log = {
            createdDate: new Date(),
            registrar: `${authentication.name} ${authentication.lastname}`, // Assume you have a way to track the current user
            title: `${t('add')} ${t('files')}`,
            message: `[${acceptedFiles.length}] ${t('files')} ${t('successfullyAdded')}`,
            data: { ...acceptedFiles }
        };
        await sendLog(log);
        toast.success('successfullyAdded')
    };


    const uploadFile = async (fileValue: Blob, fileName: string, index: number) => {
        if (!fileValue) return;

        try {
            const folderRef = ref(storage, Folders.Files(fileName));
            const uploadTask = uploadBytesResumable(folderRef, fileValue);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Calculate progress percentage
                    const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    const updatedProgress = [...progress];
                    updatedProgress[index] = progressPercent;
                    setProgress(updatedProgress);
                    console.log(updatedProgress);

                },
                (error) => {
                    console.error(error);
                }
            );

            return uploadTask;
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (fileId: string, fileUrl: string) => {
        dispatch({
            type: actionTypes.SET_GLOBAL_LOADING,
            payload: { value: true },
        });
        dispatch({
            type: actionTypes.HIDE_ASKING_MODAL,
        });
        try {
            // Manually extract the file path from the URL (after the "/o/")
            const filePath = decodeURIComponent(fileUrl.split('/o/')[1].split('?')[0]);

            // Create a reference to the file
            const fileRef = ref(storage, filePath);

            // Delete the file from Firebase Storage
            await deleteObject(fileRef);

            // Delete the file's metadata from Firestore
            const fileDoc = doc(filesCollectionRef, fileId);
            await deleteDoc(fileDoc);

            // Update the uploaded files state
            setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));

            // Show success message
            toast.success('File deleted successfully');
        } catch (error) {
            console.error("Error deleting file:", error);
            toast.error('Error deleting file');
        } finally {
            dispatch({
                type: actionTypes.SET_GLOBAL_LOADING,
                payload: { value: false },
            });
        }
    };
    const showDeleteModal = (fileId: string, fileUrl: string) => {
        dispatch({
            type: actionTypes.SHOW_ASKING_MODAL,
            payload: {
                show: true,
                message: "deleteMessage",
                btnAction: () => handleDelete(fileId, fileUrl),
            },
        });
    };

    const handleDownload = async (fileName: string, fileUrl: string) => {
        try {
            // Fetch the file blob using the Firebase Storage URL
            const response = await fetch(fileUrl); // No need for 'no-cors' after configuring CORS
            const blob = await response.blob();

            // Create an anchor element and trigger the download
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.setAttribute('download', fileName); // Specify the file name

            // Programmatically click the anchor to trigger the download
            downloadLink.click();

            // Clean up the object URL
            window.URL.revokeObjectURL(downloadLink.href);
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Download failed. Please try again.');
        }
    };


    if (!authentication.isAuthenticated) {
        return <Circle />; // or return null; for no UI during loading
    }


    if (!authentication.roles.includes(Roles.ADMIN) && !authentication.roles.includes(Roles.SUPER_ADMIN)) {
        return <NotFound />
    }

    return (
        <div style={styles.container}>
            <h2 className="title">{t('files')}</h2>

            <Button
                icon={showAddFile ? ICONS.cross : ICONS.plus}
                text={showAddFile ? t('cancel') : t('add')}
                onClick={() => { setshowAddFile(!showAddFile); setAcceptedFiles([]) }}
                btnType={showAddFile ? 'crossBtn' : 'plusBtn'}
            />
            {showAddFile &&
                <div className="margin_top_10">
                    <section className="file_drag_n_drop position_relative">
                        <div {...getRootProps({ className: 'dropzone' })}>
                            <input {...getInputProps()} />
                            {acceptedFiles.length == 0 && <p className="cursor_pointer">{t('dragFileToUpload')}</p>}
                        </div>
                        {acceptedFiles.length > 0 &&
                            <aside className="position_absolute file_list">
                                <h4>{t('files')}</h4>
                                <ul>{acceptedFiles.map(file => (
                                    <li key={file.path}>
                                        {file.path} - {file.size} bytes
                                    </li>
                                ))
                                }</ul>
                            </aside>
                        }
                    </section>
                    <div>
                        {uploading && (
                            <div>
                                {progress.map((prog, idx) => (
                                    <div key={idx}>
                                        <span>File {idx + 1} Progress: {Math.round(prog)}%</span>
                                        <progress value={prog} max="100" />
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={handleUpload}
                            disabled={!acceptedFiles || uploading || acceptedFiles.length == 0}
                            style={styles.uploadButton}
                        >
                            {uploading ? "Uploading..." : "Upload Files"}
                        </button>
                    </div>

                </div >
            }


            {
                uploadedFiles ?
                    <div className="full_width overflow_x_scroll">
                        <table className="custom_table full_width margin_top_20">
                            <thead style={{ backgroundColor: 'orange' }}>
                                <tr>
                                    <th colSpan={5}>{t('uploadedFiles')}</th>
                                </tr>
                                <tr>
                                    <th>#</th>
                                    <th>{t('name')}</th>
                                    <th>{t('size')}</th>
                                    <th>{t('date')}</th>
                                    <th>{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uploadedFiles.map((file, index) => (
                                    <tr key={file.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                {file.name}
                                            </a>
                                        </td>
                                        <td>{(file.size / 1024).toFixed(2)} KB</td>
                                        <td>{formatFirebaseDates(file.date)}</td>
                                        <td>
                                            <button
                                                onClick={() => showDeleteModal(file.id, file.url)}
                                                style={styles.deleteButton}
                                            >
                                                {t('delete')}
                                            </button>
                                            {/* <button
                                            onClick={() => handleDownload(file.name, file.url)}
                                            style={styles.downloadButton}
                                        >
                                            Download
                                        </button> */}
                                        </td>
                                    </tr>
                                ))}
                                {uploadedFiles?.length === 0 && <tr><td colSpan={5}>{t('notExist')}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    : <LoadingTemplateContainer>
                        <HeadingLoadingTemplate />
                        <HeadingLoadingTemplate />
                        <HeadingLoadingTemplate />
                        <HeadingLoadingTemplate />
                        <HeadingLoadingTemplate />
                        <HeadingLoadingTemplate />
                    </LoadingTemplateContainer>
            }


        </div >
    );
};

const styles = {
    container: {
        maxWidth: "100%",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "var(--bg-color)",
        borderRadius: "8px",
    },
    uploadButton: {
        padding: "5px 20px",
        margin: "10px 0",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
    },
    deleteButton: {
        padding: "5px 10px",
        backgroundColor: "#dc3545",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    downloadButton: {
        padding: "5px 10px",
        backgroundColor: "#28a745",  // Green color for the download button
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginLeft: "10px",  // Add margin between the Delete and Download buttons
    },
};

export default FilesManagement;
