import CryptoJS from 'crypto-js';

// Secret key for encryption (choose a strong one)
const secretKey = 'your-secret-key';

// Function to encrypt both key and value
export function encryptData(key: string, value: string) {
    const encryptedKey = CryptoJS.AES.encrypt(key, secretKey).toString();
    const encryptedValue = CryptoJS.AES.encrypt(value, secretKey).toString();
    return { encryptedKey, encryptedValue };
}

// Function to decrypt both key and value
export function decryptData(encryptedKey: string, encryptedValue: string) {
    const decryptedKey = CryptoJS.AES.decrypt(encryptedKey, secretKey).toString(CryptoJS.enc.Utf8);
    const decryptedValue = CryptoJS.AES.decrypt(encryptedValue, secretKey).toString(CryptoJS.enc.Utf8);
    return { decryptedKey, decryptedValue };
}


// Function to retrieve and decrypt data from localStorage
export function getDecryptedItem(encryptedKey) {
    const encryptedValue = localStorage.getItem(encryptedKey);
    if (encryptedKey && encryptedValue) {
        const { decryptedKey, decryptedValue } = decryptData(encryptedKey, encryptedValue);
        return { key: decryptedKey, value: decryptedValue };
    }
    return null;
}