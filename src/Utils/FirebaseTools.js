import { collection, getDoc, getDocs, query, where } from "firebase/firestore"
import { db } from "../constants/FirebaseConfig"
import Collections from "../constants/Collections"


const usersCollectionRef = collection(db, Collections.Users);



export const checkIfEmailIsAlreadyExist = async (email) => {
    const testQuery = query(usersCollectionRef, where("email", "==", email));
    const querySnapshot = await getDocs(testQuery);
    // Check if any documents were returned
    return !querySnapshot.empty;
};