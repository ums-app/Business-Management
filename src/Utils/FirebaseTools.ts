import { collection, doc, getCountFromServer, getDoc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db, storage } from "../constants/FirebaseConfig"
import Collections from "../constants/Collections"
import Folders from "../constants/Folders";
import { getDownloadURL, ref } from "firebase/storage";
import { CustomerFactor, CustomerForSaleFactor, CustomerPayment, Employee, EmployeePayment, Product, User } from "../Types/Types";
import { FactorType } from "../constants/FactorStatus";
import { mapDocToCustomer, mapDocToCustomerFactor, mapDocToCustomerPayment, mapDocToEmployee, mapDocToEmployeePayment, mapDocToProduct, mapDocToUser } from "./Mapper";



const productCollectionRef = collection(db, Collections.Products)
const customersCollectionsRef = collection(db, Collections.Customers);
const salesCollectionRef = collection(db, Collections.Sales);
const paymentCollectionRef = collection(db, Collections.Payments);
const usersCollectionRef = collection(db, Collections.Users);
const employeePaymentsCollectionRef = collection(db, Collections.EmployeePayments);
const employeesCollectionRef = collection(db, Collections.Employees);

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


//  ========================== employee service ==================================


// Function to get a document by its ID
export async function getEmployeeById(docId: string): Promise<Employee | null> {
    const docRef = doc(employeesCollectionRef, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return mapDocToEmployee(docSnap);
    } else {
        return null;  // Return null if no document found
    }
}


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
        const querySnapshot = await getDocs(salesCollectionRef);
        let items: CustomerFactor[] = querySnapshot.docs
            .map(doc => mapDocToCustomerFactor(doc)) // Map to data with id

        return items;

    } catch (error) {
        console.error("Error getting documents: ", error);
        return []
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


const getTotalNumberOfFactors = async () => {
    const snapshot = await getCountFromServer(salesCollectionRef);
    const totalDocs = snapshot.data().count;
    return totalDocs;
}



