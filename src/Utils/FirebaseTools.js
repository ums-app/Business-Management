import { collection, doc, getCountFromServer, getDoc, getDocs, orderBy, query, where } from "firebase/firestore"
import { db, storage } from "../constants/FirebaseConfig"
import Collections from "../constants/Collections"
import Folders from "../constants/Folders";
import { getDownloadURL, ref } from "firebase/storage";



const productCollectionRef = collection(db, Collections.Products)
const customersCollectionsRef = collection(db, Collections.Customers);
const salesCollectionRef = collection(db, Collections.Sales);
const paymentCollectionRef = collection(db, Collections.Payments);
const usersCollectionRef = collection(db, Collections.Users);
const employeePaymentsCollectionRef = collection(db, Collections.EmployeePayments);
const employeesCollectionRef = collection(db, Collections.Employees);

export const checkIfEmailIsAlreadyExist = async (email) => {
    const testQuery = query(usersCollectionRef, where("email", "==", email));
    const querySnapshot = await getDocs(testQuery);
    // Check if any documents were returned
    return !querySnapshot.empty;
};


// export const getProductImage = async (productId) => {
//     const imageRef = ref(storage, Folders.ProductImages(productId));  // Adjust the path to your image
//     // Fetch the download URL
//     return await getDownloadURL(imageRef)
// }


export const getProductImage = async (productId) => {
    try {
        const imageRef = ref(storage, Folders.ProductImages(productId));  // Adjust the path to your image

        // Fetch the download URL
        const downloadURL = await getDownloadURL(imageRef);

        return downloadURL;
    } catch (err) {
        const imageRef = ref(storage, Folders.DefaultImages('profile_avatar.png'))
        const downloadURL = await getDownloadURL(imageRef);
        return downloadURL;
    }
};



export const getUserImage = async (email) => {
    try {
        const imageRef = ref(storage, Folders.UserImages(email));  // Adjust the path to your image

        // Fetch the download URL
        const downloadURL = await getDownloadURL(imageRef);

        return downloadURL;
    } catch (err) {
        const imageRef = ref(storage, Folders.DefaultImages('profile_avatar.png'))
        const downloadURL = await getDownloadURL(imageRef);
        return downloadURL;
    }
};

//  =========================== product service =================================

export const getProducts = async () => {
    const querySnapshot = await getDocs(productCollectionRef);
    const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    return items
}




//  ========================== employee service ==================================


// Function to get a document by its ID
export async function getEmployeeById(docId) {
    console.log('doc id: ', docId);
    const docRef = doc(employeesCollectionRef, docId);
    console.log(docRef);

    const docSnap = await getDoc(docRef);

    console.log(docSnap.exists);

    if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id };  // Return document data
    } else {
        return null;  // Return null if no document found
    }
}


export const getAllEmployeePayments = async (employeeId) => {
    const q = query(
        employeePaymentsCollectionRef,
        where("employeeId", "==", employeeId),
        orderBy("createdDate", "asc")
    );

    try {
        const querySnapshot = await getDocs(q);
        console.log('querysnapshot is empty: ', querySnapshot.empty);
        // First map to an array, then filter and sort
        let items = querySnapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id }))
            .sort((a, b) => b.createdDate - a.createdDate);// Map to data with id

        console.log(items);

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }

}

export async function getAllVisitorFactors(visitorId) {
    const q = query(
        salesCollectionRef,
        where("visitorAccount.visitorId", "==", visitorId),
    );

    try {
        const querySnapshot = await getDocs(q);
        // First map to an array, then filter and sort
        let items = querySnapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id }))

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }
}


// ============================ cutomer service ==================================



export const getCustomerPaymentByCustomerIds = async (customerIds) => {
    const q = query(
        paymentCollectionRef,
        where('customerId', 'in', customerIds),
    );

    try {
        const querySnapshot = await getDocs(q);
        // First map to an array, then filter and sort
        let items = querySnapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id }))

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }



};


// const getProducts = async () => {
//     const querySnapshot = await getDocs(productCollectionRef);
//     const items = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
//     setProducts(items);
//     console.log(items);
// }
export const getCustomers = async () => {

    try {
        const querySnapshot = await getDocs(customersCollectionsRef);
        console.log('querysnapshot is empty: ', querySnapshot.empty);

        let items = querySnapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id }))

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }
};





// this func is going to calculate the remained value of previous factors
export const totalAmountOfAllCustomerPayments = (allCustomerPayments) => {
    // check if incomplete factors are fetched
    if (!allCustomerPayments) {
        getAllCustomerPayments();
    }
    let totalAmountOfAllPayments = 0;
    allCustomerPayments?.forEach(py => {
        totalAmountOfAllPayments += Number(py.amount);
    })

    // console.log('totalpaymentamount:', totalAmountOfAllPayments);
    return totalAmountOfAllPayments;
}

// this func is going to calculate the remained value of previous factors
export const totalAmountOfAllFactors = (customerFactors) => {
    // check if incomplete factors are fetched
    if (!customerFactors) {
        getCustomerFactors();
    }
    let totalRemainedOfAllFactor = 0;
    customerFactors?.forEach(fac => {
        // console.log((fac));
        totalRemainedOfAllFactor += getTotalPriceOfFactor(fac);
    })
    return totalRemainedOfAllFactor;
}


export const getAllPayments = async () => {

    try {
        const querySnapshot = await getDocs(paymentCollectionRef);

        let items = querySnapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id }))

        return items;
    } catch (error) {
        // console.error("Error getting documents: ", error);
        return []
    }
};




export const getAllCustomerPayments = async (customerId) => {
    const q = query(
        paymentCollectionRef,
        where("customerId", "==", customerId),
        orderBy("date", "asc")
    );

    try {
        const querySnapshot = await getDocs(q);
        // First map to an array, then filter and sort
        let items = querySnapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id }))

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }
};


export const getFactors = async () => {

    try {
        const querySnapshot = await getDocs(salesCollectionRef);
        let items = querySnapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id })) // Map to data with id

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }
}


export const getCustomerFactors = async (customerId) => {

    const q = query(
        salesCollectionRef,
        where("customer.id", "==", customerId),
    );

    try {
        const querySnapshot = await getDocs(q);
        console.log('querysnapshot is empty: ', querySnapshot.empty);
        // First map to an array, then filter and sort
        let items = querySnapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id })) // Map to data with id
            .sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()); // Sort by date

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }
}

export const getTotalPriceOfFactor = (fac) => {
    let totalPriceOfFac = 0
    if (fac) {
        fac?.productsInFactor?.forEach(item => {
            // console.log("totalprice of fac: " + fac.id, totalPriceOfFac);
            totalPriceOfFac += Number(item.totalPrice)
        })

    }

    return totalPriceOfFac;
}





//  ======================== factors =================================


const getTotalNumberOfFactors = async () => {
    const snapshot = await getCountFromServer(salesCollectionRef);
    const totalDocs = snapshot.data().count;
    return totalDocs;
}



