import { addDoc, collection, deleteDoc, doc, getCountFromServer, getDoc, getDocs, limit, orderBy, query, setDoc, Timestamp, Transaction, updateDoc, where } from "firebase/firestore"
import { db, messaging, storage } from "../constants/FirebaseConfig"
import Collections from "../constants/Collections"
import Folders from "../constants/Folders";
import { getDownloadURL, ref } from "firebase/storage";
import { CustomerFactor, CustomerForSaleFactor, CustomerPayment, Employee, EmployeePayment, Log, Partner, Product, Representation, User } from "../Types/Types";
import { FactorType } from "../constants/FactorStatus";
import { mapDocToConsumptions, mapDocToCustomer, mapDocToCustomerFactor, mapDocToCustomerPayment, mapDocToEmployee, mapDocToEmployeePayment, mapDocToLog, mapDocToPartner, mapDocToProduct, mapDocToProductPurchase, mapDocToRepresentation, mapDocToUploadedFile, mapDocToUser } from "./Mapper";
import { UploadedFile } from "../components/FilesManagement/FilesManagement";
import { Consumption } from "../components/Consumptions/AddConsumptions/AddConsumptions";
import { apiKey, ConsumptionsType, vapidKey } from "../constants/Others";
import { getToken } from "firebase/messaging";
import { PurchaseFactor } from "../components/PurchaseProducts/AddPurchaseProducts/AddPurchaseProducts";



const productCollectionRef = collection(db, Collections.Products)
const customersCollectionsRef = collection(db, Collections.Customers);
const salesCollectionRef = collection(db, Collections.Sales);
const paymentCollectionRef = collection(db, Collections.Payments);
const usersCollectionRef = collection(db, Collections.Users);
const employeePaymentsCollectionRef = collection(db, Collections.EmployeePayments);
const employeesCollectionRef = collection(db, Collections.Employees);
const filesCollectionRef = collection(db, Collections.Files);
const partnersCollectionRef = collection(db, Collections.Partners);
const consumptionCollectionRef = collection(db, Collections.Consumptions);
const logCollectionsRef = collection(db, Collections.Logs);
const purchasesCollectionRef = collection(db, Collections.Purchases);
const representationsCollectionRef = collection(db, Collections.Representations)

export const checkIfEmailIsAlreadyExist = async (email: string): Promise<Boolean> => {
    const testQuery = query(usersCollectionRef, where("email", "==", email));
    const querySnapshot = await getDocs(testQuery);
    // Check if any documents were returned
    return !querySnapshot.empty;
};


export const getProductImage = async (productId: string): Promise<String> => {
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


export const getAllUploadedFile = async (): Promise<UploadedFile[]> => {
    const q = query(
        filesCollectionRef,
        orderBy("date", 'asc')
    );
    try {
        const docSnap = await getDocs(q);
        console.log('users: ', docSnap.docs);
        return docSnap.docs.map(item => mapDocToUploadedFile(item));
    } catch (err) {
        throw err
    }
};





export const getUserImage = async (email: string): Promise<string> => {
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







//  ============= users =================
// Function to get a document by its ID
export async function getUserByEmail(email: string): Promise<User | undefined> {
    const q = query(
        usersCollectionRef,
        where("email", "==", email.toLowerCase())
    );
    try {
        const docSnap = await getDocs(q);
        console.log('users: ', docSnap.docs);
        if (docSnap.docs.length > 0)
            return mapDocToUser(docSnap.docs[0]);
    } catch (err) {
        throw err
    }
}


// Function to get a document by its ID
export async function disableUserAccountBy(user: User): Promise<any> {
    const customerDoc = doc(db, Collections.Users, user.id)
    return updateDoc(customerDoc, { ...user, disabled: true });
}

// Function to get a document by its ID
export async function enableUserAccountBy(user: User): Promise<any> {
    const customerDoc = doc(db, Collections.Users, user.id)
    return updateDoc(customerDoc, { ...user, disabled: false });
}














//  =========================== product service =================================

export const getProducts = async (): Promise<Product[]> => {
    const querySnapshot = await getDocs(productCollectionRef);
    const items: Product[] = querySnapshot.docs.map((doc) => {
        return mapDocToProduct(doc)
    });
    return items
}

export const getProductById = async (productId: string): Promise<Product> => {
    const data = await getDoc(doc(db, Collections.Products, productId));
    return mapDocToProduct(data)
}

//  =========================== partner service =================================

export const getPartners = async (): Promise<Partner[]> => {
    const querySnapshot = await getDocs(partnersCollectionRef);
    const items: Partner[] = querySnapshot.docs.map((doc) => {
        return mapDocToPartner(doc)
    });
    return items
}

export const getPartnerById = async (partnerId: string): Promise<Partner> => {
    const docRef = doc(partnersCollectionRef, partnerId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return mapDocToPartner(docSnap);
    } else {
        throw new Error('Not found')
    }

}



//  =========================== consumptions service =================================

export const getConsumptionsByType = async (type: string): Promise<Consumption[]> => {
    const q = query(
        consumptionCollectionRef,
        where("type", "==", type),
        orderBy("date", "asc")
    );
    const querySnapshot = await getDocs(q);
    const items: Consumption[] = querySnapshot.docs.map((doc) => {
        return mapDocToConsumptions(doc)
    });
    return items
}

export const getTodayConsumptions = async (): Promise<Consumption[]> => {
    const date = new Date();
    // Get the start and end of today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const q = query(
        consumptionCollectionRef,
        where("date", ">=", Timestamp.fromDate(startOfDay)), // Start of today
        where("date", "<=", Timestamp.fromDate(endOfDay)),   // End of today
        orderBy("date", "asc")
    );

    const querySnapshot = await getDocs(q);

    // Map the documents to Consumption items
    return querySnapshot.docs.map((doc) => mapDocToConsumptions(doc));
};

export const getConsumptionsWithdrawOfPartner = async (partnerId: string): Promise<Consumption[]> => {
    const q = query(
        consumptionCollectionRef,
        where("type", "==", ConsumptionsType.WITHDRAW),
        where("to.id", "==", partnerId),
        orderBy("date", "asc")
    );
    const querySnapshot = await getDocs(q);
    console.log('cons: w: ', querySnapshot.docs);

    const items: Consumption[] = querySnapshot.docs.map((doc) => {
        return mapDocToConsumptions(doc)
    });
    return items
}

export const getAllConsumptions = async (): Promise<Consumption[]> => {
    const querySnapshot = await getDocs(collection(db, Collections.Consumptions));
    return querySnapshot.docs.map(doc => mapDocToConsumptions(doc));
};



// =====================================product purchase =================================================


export const getProductPurchases = async (): Promise<PurchaseFactor[]> => {
    const q = query(
        purchasesCollectionRef,
        orderBy("createdDate", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => mapDocToProductPurchase(doc));

};


export async function getLatestPurchaseProrductFactor(): Promise<PurchaseFactor> {

    // Create a query to get the most recent document
    const q = query(salesCollectionRef, orderBy('createdAt', 'desc'), limit(1));

    // Fetch the documents
    const querySnapshot = await getDocs(q);

    // Check if there's a document
    if (!querySnapshot.empty) {
        const latestDoc = querySnapshot.docs[0];
        return mapDocToProductPurchase(latestDoc.data());
    } else {
        console.log('No documents found');
        throw new Error('not found')
    }
}









// ================================= notification service ================================================== //


export const requestPermissionAndGetToken = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: vapidKey, // Replace with your VAPID key
            });
            console.log('FCM Token:', token);
            return token;
        } else {
            console.log('Notification permission denied');
        }
    } catch (error) {
        console.error('Error getting token:', error);
    }
};

const requestPermissionAndStoreToken = async (userId: string) => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: 'YOUR_VAPID_KEY', // VAPID key from Firebase Console
            });

            // Store the token in Firestore under the user's document
            await setDoc(doc(db, 'users', userId), { fcmToken: token }, { merge: true });
            console.log('FCM Token saved to Firestore:', token);
            return token;
        } else {
            console.log('Notification permission denied');
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
    }
};


// export const sendNotification = async (token: string, title: string, body: string, additionalData) => {
//     const serverKey = apiKey; // Replace with your Firebase server key

//     const notificationPayload = {
//         to: token, // The FCM token of the device you want to send the notification to
//         notification: {
//             title: title,
//             body: body,
//         },
//         data: {
//             additionalData: additionalData,
//         },
//     };

//     try {
//         await axios.post('https://fcm.googleapis.com/fcm/send', notificationPayload, {
//             headers: {
//                 Authorization: `key=${serverKey}`,
//                 'Content-Type': 'application/json',
//             },
//         });
//         console.log('Notification sent successfully');
//     } catch (error) {
//         console.error('Error sending notification:', error);
//     }
// };

// const sendNotificationToSuperAdmin = async (title: string, body: string) => {
//     try {
//         // Query Firestore to get the Super_Admin's FCM token
//         const usersRef = collection(db, 'users');
//         const superAdminQuery = query(usersRef, where('userType', '==', 'Super_Admin'));


//         const querySnapshot = await getDocs(superAdminQuery);
//         if (!querySnapshot.empty) {
//             const superAdminData = querySnapshot.docs[0].data(); // Get the first matching Super_Admin
//             const superAdminToken = superAdminData.fcmToken;

//             // Send a notification to the Super_Admin
//             const notificationPayload = {
//                 to: superAdminToken, // Super_Admin's FCM Token
//                 notification: {
//                     title: title,
//                     body: body,
//                 },
//                 data: {
//                     extraInfo: 'Additional information about the action',
//                 },
//             };

//             await axios.post('https://fcm.googleapis.com/fcm/send', notificationPayload, {
//                 headers: {
//                     Authorization: `key=${apiKey}`, // Firebase Server Key
//                     'Content-Type': 'application/json',
//                 },
//             });
//             console.log('Notification sent to Super_Admin');
//         } else {
//             console.log('No Super_Admin found in Firestore.');
//         }
//     } catch (error) {
//         console.error('Error sending notification:', error);
//     }
// };



// ======================== log service ==========================================

export async function sendLog(log: Log) {
    return await addDoc(logCollectionsRef, log);
}



export async function getAllLogs(): Promise<Log[]> {
    const querySnapshot = await getDocs(logCollectionsRef);
    // Map the documents to Consumption items
    return querySnapshot.docs.map((doc) => mapDocToLog(doc));
}

export async function getTodayLogs(): Promise<Log[]> {
    const date = new Date();
    // Get the start and end of today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const q = query(
        logCollectionsRef,
        where("createdDate", ">=", Timestamp.fromDate(startOfDay)), // Start of today
        where("createdDate", "<=", Timestamp.fromDate(endOfDay)),   // End of today
        orderBy("createdDate", "asc")
    );

    const querySnapshot = await getDocs(q);

    // Map the documents to Consumption items
    return querySnapshot.docs.map((doc) => mapDocToLog(doc));
}

// ============================ Representors ====================================

export async function getAllRepresentations(): Promise<Representation[]> {
    const docsRef = await getDocs(representationsCollectionRef);
    return docsRef.docs.map(doc => mapDocToRepresentation(doc));
}

export async function getRepresentorById(docId: string): Promise<Representation> {
    const docRef = doc(representationsCollectionRef, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return mapDocToRepresentation(docSnap);
    } else {
        throw new Error('Not found')
    }

}


//  ========================== employee service ==================================


// Function to get a document by its ID
export async function getEmployeeById(docId: string): Promise<Employee> {
    const docRef = doc(employeesCollectionRef, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return mapDocToEmployee(docSnap);
    } else {
        throw new Error('Not found')
    }
}

export const getEmployees = async () => {
    const querySnapshot = await getDocs(employeesCollectionRef);
    return querySnapshot.docs.map((doc) => mapDocToEmployee(doc));
};


export const getAllEmployeePayments = async (employeeId: string): Promise<EmployeePayment[]> => {
    const q = query(
        employeePaymentsCollectionRef,
        where("employeeId", "==", employeeId),
        orderBy("date", "asc")
    );

    try {
        const querySnapshot = await getDocs(q);
        console.log('querysnapshot is empty: ', querySnapshot.empty);
        // First map to an array, then filter and sort
        let items: EmployeePayment[] = querySnapshot.docs
            .map(doc => mapDocToEmployeePayment(doc))
        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }
}

export async function getAllVisitorFactors(visitorId: string): Promise<CustomerFactor[]> {
    const q = query(
        salesCollectionRef,
        where("visitorAccount.visitorId", "==", visitorId),
    );

    try {
        const querySnapshot = await getDocs(q);
        // First map to an array, then filter and sort
        let items: CustomerFactor[] = querySnapshot.docs
            .map(doc => mapDocToCustomerFactor(doc))

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }
}


// ============================ cutomer service ==================================



export const getCustomerPaymentByCustomerIds = async (customerIds: string[]): Promise<CustomerPayment[]> => {
    const q = query(
        paymentCollectionRef,
        where('customerId', 'in', customerIds),
    );

    try {
        const querySnapshot = await getDocs(q);
        // First map to an array, then filter and sort
        let items: CustomerPayment[] = querySnapshot.docs
            .map(doc => mapDocToCustomerPayment(doc))

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }
};


export const getCustomers = async (): Promise<CustomerForSaleFactor[]> => {

    try {
        const querySnapshot = await getDocs(customersCollectionsRef);
        console.log('querysnapshot is empty: ', querySnapshot.empty);

        let items: any[] = querySnapshot.docs
            .map(doc => mapDocToCustomer(doc))

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }
};

// this function is for customer list of other cities 
export const getCustomersByCustomerTypes = async (types: string[]): Promise<CustomerForSaleFactor[]> => {

    try {
        const q = query(
            customersCollectionsRef,
            where("customerType", "in", types),
        );
        const querySnapshot = await getDocs(q);
        console.log('querysnapshot is empty: ', querySnapshot.empty);

        let items: any[] = querySnapshot.docs
            .map(doc => mapDocToCustomer(doc))
        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }
};


export const getCustomersByCustomerById = async (id: string): Promise<CustomerForSaleFactor> => {
    const docRef = doc(customersCollectionsRef, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return mapDocToCustomer(docSnap);
    } else {
        throw new Error('Not found')
    }
};




// this func is going to calculate the remained value of previous factors
export const totalAmountOfAllCustomerPayments = (allCustomerPayments: CustomerPayment[]): number => {
    // check if incomplete factors are fetched
    if (!allCustomerPayments) {
        return 0;
    }
    let totalAmountOfAllPayments = 0;
    allCustomerPayments?.forEach(py => {
        totalAmountOfAllPayments += Number(py.amount);
    })

    // console.log('totalpaymentamount:', totalAmountOfAllPayments);
    return totalAmountOfAllPayments;
}

// this func is going to calculate the remained value of previous factors
export const totalAmountOfAllFactors = (customerFactors: CustomerFactor[]): number => {
    // check if incomplete factors are fetched
    if (!customerFactors) {
        return 0;
    }
    let totalRemainedOfAllFactor = 0;
    customerFactors?.forEach(fac => {
        // console.log((fac));
        totalRemainedOfAllFactor += getTotalPriceOfFactor(fac);
    })
    return totalRemainedOfAllFactor;
}


export const getAllPayments = async (): Promise<CustomerPayment[]> => {

    try {
        const querySnapshot = await getDocs(paymentCollectionRef);

        let items: CustomerPayment[] = querySnapshot.docs
            .map(doc => mapDocToCustomerPayment(doc));

        return items;
    } catch (error) {
        // console.error("Error getting documents: ", error);
        return []
    }
};

export const getAllCustomerPaymentsOfToday = async (): Promise<CustomerPayment[]> => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Start of today (midnight)

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // End of today

    const q = query(
        paymentCollectionRef,
        where("createdDate", ">=", startOfDay),
        where("createdDate", "<=", endOfDay)
    );
    try {
        const querySnapshot = await getDocs(q);
        let items: CustomerPayment[] = querySnapshot.docs
            .map(doc => mapDocToCustomerPayment(doc));
        return items;
    } catch (error) {
        // console.error("Error getting documents: ", error);
        return []
    }
};





export const getAllCustomerPayments = async (customerId: string): Promise<CustomerPayment[]> => {
    const q = query(
        paymentCollectionRef,
        where("customerId", "==", customerId),
        orderBy("date", "asc")
    );

    try {
        const querySnapshot = await getDocs(q);
        // First map to an array, then filter and sort
        let items: CustomerPayment[] = querySnapshot.docs
            .map(doc => mapDocToCustomerPayment(doc))

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }
};


export const getFactors = async (): Promise<CustomerFactor[]> => {

    try {
        const q = query(
            salesCollectionRef,
            orderBy("createdDate", "asc")
        );
        const querySnapshot = await getDocs(q);
        let items: CustomerFactor[] = querySnapshot.docs
            .map(doc => mapDocToCustomerFactor(doc)) // Map to data with id

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }
}

export const getFactorsOfToday = async (): Promise<CustomerFactor[]> => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Start of today (midnight)

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // End of today

    const q = query(
        salesCollectionRef,
        where("createdDate", ">=", startOfDay),
        where("createdDate", "<=", endOfDay)
    );

    try {
        const querySnapshot = await getDocs(q);
        const items: CustomerFactor[] = querySnapshot.docs.map(doc => mapDocToCustomerFactor(doc));
        return items;
    } catch (error) {
        console.error("Error getting documents: ", error);
        return [];
    }
};

export async function getLatestFactor(): Promise<CustomerFactor> {

    // Create a query to get the most recent document
    const q = query(salesCollectionRef, orderBy('createdAt', 'desc'), limit(1));

    // Fetch the documents
    const querySnapshot = await getDocs(q);

    // Check if there's a document
    if (!querySnapshot.empty) {
        const latestDoc = querySnapshot.docs[0];
        return mapDocToCustomerFactor(latestDoc.data());
    } else {
        console.log('No documents found');
        throw new Error('not found')
    }
}


export const getStandardFactors = async (): Promise<CustomerFactor[]> => {

    try {
        const q = query(
            salesCollectionRef,
            where("type", "==", FactorType.STANDARD_FACTOR),
        );

        const querySnapshot = await getDocs(q);
        let items: CustomerFactor[] = querySnapshot.docs
            .map(doc => mapDocToCustomerFactor(doc)) // Map to data with id

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
    }
}



export const getCustomerFactors = async (customerId: string): Promise<CustomerFactor[]> => {

    const q = query(
        salesCollectionRef,
        where("customer.id", "==", customerId),
    );

    try {
        const querySnapshot = await getDocs(q);
        console.log('querysnapshot is empty: ', querySnapshot.empty);

        // First map to an array, then filter and sort
        let items: CustomerFactor[] = querySnapshot.docs
            .map(doc => mapDocToCustomerFactor(doc))

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return [];
    }
}


export const getTotalPriceOfFactor = (fac: CustomerFactor): number => {
    let totalPriceOfFac: number = 0
    if (fac) {
        fac?.productsInFactor?.forEach(item => {
            // console.log("totalprice of fac: " + fac.id, totalPriceOfFac);
            totalPriceOfFac += Number(item.totalPrice)
        })
    }

    return totalPriceOfFac;
}



//  ======================== factors =================================


export const getCustomerPaymentByFactorId = async (factorId: string): Promise<CustomerPayment> => {
    const q = query(
        paymentCollectionRef,
        where("saleId", "==", factorId),
    );

    try {
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return mapDocToCustomerPayment(querySnapshot.docs[0]);
        }
        throw new Error("not found")
    } catch (error) {
        throw new Error("not found")
    }

}


export const deleteCustomerPaymentByFactorId = async (factorId: string, transaction: Transaction): Promise<void> => {
    const q = query(
        paymentCollectionRef,
        where("saleId", "==", factorId),
    );

    try {
        const querySnapshot = await getDocs(q);
        console.log('gettings factor pays:', querySnapshot.docs);

        if (!querySnapshot.empty) {
            const payment = querySnapshot.docs[0];
            const paymentDocRef = doc(db, Collections.Payments, payment.id);
            // Use the transaction to delete the payment document
            transaction.delete(paymentDocRef);
            console.log('after deleting factor pay');

        } else {
            throw new Error("Payment not found");
        }
    } catch (error) {
        console.error("Error deleting payment by factor ID: ", error);
        throw new Error("Payment deletion failed");
    }
}




