import { doc, DocumentData, DocumentSnapshot } from "firebase/firestore";
import { CustomerFactor, CustomerForSaleFactor, CustomerPayment, Employee, EmployeePayment, Log, Partner, Product, Representation, User } from "../Types/Types";
import { UploadedFile } from "../components/FilesManagement/FilesManagement";
import { Consumption } from "../components/Consumptions/AddConsumptions/AddConsumptions";
import { PurchasedProduct, PurchaseFactor } from "../components/PurchaseProducts/AddPurchaseProducts/AddPurchaseProducts";


// ==>   in this file we are going to map the DocumentData object to appropriate data object using mapper function  <== //

export const mapDocToCustomer = (doc: DocumentData): CustomerForSaleFactor => {
    const data = doc.data();
    return {
        id: doc.id,
        createdDate: data.createdDate,
        email: data.email,
        joinedDate: data.joinedDate,
        lastName: data.lastName,
        location: data.location,
        name: data.name,
        password: data.password,
        phoneNumber: data.phoneNumber,
        visitor: data.visitor,
        customerType: data.customerType
    }
}


export const mapDocToEmployee = (doc: DocumentData): Employee => {
    const data = doc.data();
    return {
        id: doc.id,
        createdDate: data.createdDate,
        email: data.email,
        joinedDate: data.joinedDate,
        lastName: data.lastName,
        name: data.name,
        password: data.password,
        phoneNumber: data.phoneNumber,
        jobTitle: data.jobTitle,
        profileImage: data.profileImage,
        salary: data.salary,
        salaryHistory: data.salaryHistory,
        visitorAmount: data.visitorAmount,
        visitorContractType: data.visitorContractType
    }
}

export const mapDocToUser = (doc: DocumentData): User => {
    const data = doc.data();
    console.log(data);

    return {
        id: doc.id,
        joinedDate: data.joinedDate,
        lastName: data.lastName,
        name: data.name,
        originalEntityId: data.originalEntityId,
        password: data.password,
        phoneNumber: data.phoneNumber,
        email: data.email,
        roles: data.roles,
        userType: data.userType,
        disabled: data.disabled
    }
}



export const mapDocToEmployeePayment = (doc: DocumentData): EmployeePayment => {
    const data = doc.data();
    return {
        amount: data.amount,
        employeeId: data.employeeId,
        createdDate: data.createdDate,
        date: data.date,
        by: data.by,
        type: data.type,
        id: doc.id
    }
}


export const mapDocToCustomerPayment = (doc: DocumentData): CustomerPayment => {
    const data = doc.data();
    return {
        id: doc.id,
        amount: data.amount,
        by: data.by,
        checkNumber: data.checkNumber,
        createdDate: data.createdDate,
        date: data.date,
        customerId: data.customerId,
        saleId: data.saleId
    }
}



export const mapDocToCustomerFactor = (doc: DocumentData): CustomerFactor => {
    const data = doc.data();
    return {
        id: doc.id,
        productsInFactor: data.productsInFactor,
        customer: data.customer,
        createdDate: data.createdDate,
        indexNumber: data.indexNumber,
        type: data.type,
        by: data.by,
        paidAmount: Number(data.paidAmount),
        visitorAccount: data.visitorAccount,
        totalAll: Number(data.totalAll),
        currentRemainedAmount: Number(data.currentRemainedAmount),
        previousRemainedAmount: Number(data.previousRemainedAmount)
    }
}


export const mapDocToProduct = (doc: DocumentData): Product => {
    const data = doc.data();
    return {
        id: doc.id,
        code: data.code,
        createdDate: data.createdDate,
        inventory: data.inventory,
        englishName: data.englishName,
        name: data.name,
        manufacturer: data.manufacturer,
        price: data.price
    }
}


export const mapDocToUploadedFile = (docSnapshot: DocumentData) => {
    const docData = docSnapshot?.data(); // Extract data
    return {
        id: docSnapshot.id, // Use the document ID
        name: docData.name,
        size: docData.size,
        url: docData.url,
        date: docData.date,
    };
};



export const mapDocToPartner = (docSnapshot: DocumentData): Partner => {
    const docData = docSnapshot?.data(); // Extract data
    return {
        id: docSnapshot.id, // Use the document ID
        capitalHistory: docData.capitalHistory,
        createdDate: docData.createdDate,
        joinedDate: docData.joinedDate,
        initialCapital: docData.initialCapital,
        lastName: docData.lastName,
        name: docData.name,
        phoneNumber: docData.phoneNumber,
        email: docData.email,
        password: docData.password
    };
};


export const mapDocToConsumptions = (docSnapshot: DocumentData): Consumption => {
    const docData = docSnapshot?.data(); // Extract data
    return {
        id: docSnapshot.id, // Use the document ID
        amount: docData.amount,
        createdDate: docData.createdDate,
        date: docData.date,
        descriptions: docData.descriptions,
        registrar: docData.registrar,
        to: docData.to,
        type: docData.type
    };
};

export const mapDocToLog = (docSnapshot: DocumentData): Log => {
    const docData = docSnapshot?.data(); // Extract data
    return {
        id: docSnapshot.id, // Use the document ID
        createdDate: docData.createdDate,
        message: docData.message,
        registrar: docData.registrar,
        title: docData.title,
        data: docData.data
    };
};



export const mapDocToProductPurchase = (docSnapshot: DocumentData): PurchaseFactor => {
    const docData = docSnapshot?.data(); // Extract data
    return {
        id: docSnapshot.id, // Use the document ID
        createdDate: docData.createdDate,
        currency: docData.currency,
        indexNumber: docData.indexNumber,
        products: docData.products,
        totalAmount: docData.totalAmount,
        totalPackage: docData.totalPackage,
        totalProducts: docData.totalProducts,
    };
};



export const mapDocToRepresentation = (docSnapshot: DocumentData): Representation => {
    const docData = docSnapshot?.data(); // Extract data
    return {
        id: docSnapshot.id, // Use the document ID
        createdDate: docData.createdDate,
        currencyType: docData.currencyType,
        amountOfLoan: docData.amountOfLoan,
        customer: docData.customer
    };
};

