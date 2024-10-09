import { DocumentData } from "firebase/firestore";
import { CustomerFactor, CustomerForSaleFactor, CustomerPayment, Employee, EmployeePayment, Product, User } from "../Types/Types";


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
        visitor: data.visitor
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
        paidAmount: data.paidAmount,
        visitorAccount: data.visitorAccount,
        totalAll: data.totalAll,
        currentRemainedAmount: data.currentRemainedAmount,
        previousRemainedAmount: data.previousRemainedAmount
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

