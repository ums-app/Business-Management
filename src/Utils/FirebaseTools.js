import { collection, getDoc, getDocs, query, where } from "firebase/firestore"
import { db, storage } from "../constants/FirebaseConfig"
import Collections from "../constants/Collections"
import Folders from "../constants/Folders";
import { getDownloadURL, ref } from "firebase/storage";


const usersCollectionRef = collection(db, Collections.Users);



export const checkIfEmailIsAlreadyExist = async (email) => {
    const testQuery = query(usersCollectionRef, where("email", "==", email));
    const querySnapshot = await getDocs(testQuery);
    // Check if any documents were returned
    console.log(!querySnapshot.empty);
    return !querySnapshot.empty;
};


export const getProductImage = async (productId) => {
    const imageRef = ref(storage, Folders.ProductImages(productId));  // Adjust the path to your image
    // Fetch the download URL
    return await getDownloadURL(imageRef)
}



export const getUserImage = async (email) => {
    try {
        const imageRef = ref(storage, Folders.UserImages(email));  // Adjust the path to your image
        console.log('image ref', imageRef);
        // Fetch the download URL
        const downloadURL = await getDownloadURL(imageRef);
        console.log('in get image fun: ', email, downloadURL);
        return downloadURL;
    } catch (err) {
        console.log(err);
        const imageRef = ref(storage, Folders.DefaultImages('profile_avatar.png'))
        const downloadURL = await getDownloadURL(imageRef);
        return downloadURL;
    }
};