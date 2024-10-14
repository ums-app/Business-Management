import React, { useState, useEffect } from "react";
import { addDoc, collection, deleteDoc, doc, Timestamp } from "firebase/firestore";
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
import { getAllUploadedFile } from "../../Utils/FirebaseTools";
import LoadingTemplateContainer from "../UI/LoadingTemplate/LoadingTemplateContainer";
import HeadingLoadingTemplate from "../UI/LoadingTemplate/HeadingLoadingTemplate";


export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    url: string;
    date: Date | Timestamp;
}

const FilesManagement: React.FC = () => {
    const [files, setFiles] = useState<FileList | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>();
    const [uploading, setUploading] = useState(false);
    const [showAddFile, setshowAddFile] = useState(false)
    const [progress, setProgress] = useState<number[]>([]);
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

    // Firestore collection reference
    const filesCollectionRef = collection(db, Collections.Files);

    // Fetch uploaded files from Firestore on component mount
    useEffect(() => {
        getAllUploadedFile()
            .then(res => {
                setUploadedFiles(res)
            })
    }, []);



    const handleUpload = async () => {
        if (!files || files.length === 0) return;
        setUploading(true);
        const progressArray = new Array(files.length).fill(0); // Initialize progress array

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = `${file.name}-[${new Date().getMilliseconds()}]`;

            const uploadTask = uploadFile(file, fileName, i);

            uploadTask.then((res) => {
                // Once the upload is complete, get the download URL
                getDownloadURL(res.ref).then((url) => {
                    // Save file metadata including the download URL to Firestore
                    const fileData = {
                        name: file.name,
                        size: file.size,
                        url: url, // Use the download URL here
                        date: new Date().toLocaleString(),
                        descriptions: ''
                    };

                    addDoc(filesCollectionRef, fileData)
                        .then((docRes) => {
                            setUploadedFiles((prev) => [
                                ...prev,
                                mapDocToUploadedFile(docRes),
                            ]);
                        });
                });
            });
        }

        setUploading(false);
        setFiles(null);
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

    // Handle file deletion
    const handleDelete = async (fileId: string, fileName: string) => {
        const fileRef = ref(storage, Folders.Files(fileName));
        await deleteObject(fileRef)
        const fileDoc = doc(filesCollectionRef, fileId)
        await deleteDoc(fileDoc);
        setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
        toast.success('successfullyDeleted')
    };
    console.log(uploadedFiles);



    return (
        <div style={styles.container}>
            <h2 className="title">{t('files')}</h2>

            <Button
                icon={showAddFile ? ICONS.cross : ICONS.plus}
                text={showAddFile ? t('cancel') : t('add')}
                onClick={() => setshowAddFile(!showAddFile)}
                btnType={showAddFile ? 'crossBtn' : 'plusBtn'}
            />
            {showAddFile &&
                <div className="margin_top_10">
                    <section className="file_drag_n_drop">
                        <div {...getRootProps({ className: 'dropzone' })}>
                            <input {...getInputProps()} />
                            <p>{t('dragFileToUpload')}</p>
                        </div>
                        {acceptedFiles.length > 0 &&
                            <aside>
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

                </div>
            }


            {uploadedFiles ?
                <table className="custom_table full_width margin_top_20">
                    <thead >
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
                                        onClick={() => handleDelete(file.id, file.url)}
                                        style={styles.deleteButton}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                : <LoadingTemplateContainer>
                    <HeadingLoadingTemplate />
                    <HeadingLoadingTemplate />
                    <HeadingLoadingTemplate />
                    <HeadingLoadingTemplate />
                    <HeadingLoadingTemplate />
                    <HeadingLoadingTemplate />
                </LoadingTemplateContainer>}

            {uploadedFiles?.length === 0 && <p>No files uploaded yet.</p>}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "100%",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
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
};

export default FilesManagement;
