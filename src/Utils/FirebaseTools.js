import { collection, getDoc, query, where } from "firebase/firestore"
import { db } from "../constants/FirebaseConfig"
import Collections from "../constants/Collections"


const usersCollectionRef = collection(db, Collections.Users);



export const checkIfEmailIsAlreadyExist = async (email) => {
    const testQuery = query(usersCollectionRef, where("email", "==", email))
    const isEmailExist = await getDoc(testQuery)
    return isEmailExist.exists();

}