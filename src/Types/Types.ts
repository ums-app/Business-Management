import { Timestamp } from "firebase/firestore";
import { FactorType } from "../constants/FactorStatus";

export interface ProductForSale {
    productId: string;
    name: string,
    englishName: string,
    total: number,
    pricePer: number,
    discount: {
        value: number;
        type: string
    },
    totalPrice: number,
};


export interface userPayment {
    amount: number;
    createdDate: Date;
    by: string;
    saleId: string;
    customerId: string;
    date: Date;
}

export interface CustomerFactor {
    id: string;
    productsInFactor: ProductForSale[],
    customer: CustomerForSaleFactor,
    createdDate: Date,
    indexNumber: number,
    type: string,
    by: string,
    paidAmount: number,
    totalAll: number,
    visitorAccount: {
        visitorId: string;
        VisitorContractType: string;
        visitorContractAmount: number,
        visitorAmount: number,
    } | null
}

export interface UpdateModeProps {
    updateMode: boolean; // Change this to the correct type if necessary
}

export interface CustomerForSaleFactor {
    createdDate: Timestamp | Date;
    email: string;
    id: string;
    joinedDate: Timestamp | Date;
    lastName: string;
    name: string;
    location: string;
    password: string;
    visitor: string | null | undefined;
    phoneNumber: string;
}



export interface Employee {
    id: string;
    createdDate: Date | Timestamp;
    email: string;
    jobTitle: string;
    joinedDate: Timestamp | Date;
    lastName: string;
    name: string
    password: string;
    phoneNumber: string;
    profileImage: string;
    salary: number
    salaryHistory: []
    visitorAmount: number;
    visitorContractType: string;
}


export interface CustomerPayment {
    id: string;
    amount: number;
    by: string;
    checkNumber: number;
    createdDate: Timestamp | Date;
    date: Timestamp | Date;
    customerId: string;
    saleId: string | null
}

export interface Factor {
    amount: number
    by: string;
    checkNumber: number;
    createdDate: Timestamp | Date;
    date: Timestamp | Date;
    customerId: string;
    saleId: string | null
}
export interface EmployeePayment {
    id: string;
    amount: number;
    by: string;
    createdDate: Timestamp | Date;
    date: Timestamp | Date;
    employeeId: string;
    type: string
}


export interface Product {
    id: string;
    code: number;
    createdDate: Timestamp | Date;
    inventory: number;
    englishName: string,
    name: string,
    manufacturer: string,
    price: number,

}



export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: string; // Optional, because not all buttons may need an icon
    btnType?: string; // This could be more specific if you know the types of button styles
    text?: string; // Optional if buttons don’t always require text
    loading?: boolean; // Optional: default value can be 'false'
    isLock?: boolean; // Optional: default value can be 'false'
    isConfirmed?: boolean; // Optional: default value can be 'false'
    props: Record<string, any>
}

export interface AuthenticationType {
    isAuthenticated: boolean;
    name: string | null;
    lastName: string | null;
    email: string | null;
    userId: string | null;
    imageURL: string | null;
    roles: string[];
}
export interface AskingModal {
    show: boolean,
    message: string,
    btnAction: Function | null,
    id: string | null
}


export interface ConfirmModal {
    show: boolean,
    message: string,
    iconType: string
}

