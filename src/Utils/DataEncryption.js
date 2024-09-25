
// Here’s a step - by - step example of how to encrypt and decrypt user data using AES-GCM with the Web Crypto API and store it in localStorage.

//     Steps:
// Generate an encryption key.
// Encrypt the data(user data) using the key.
//     Store the encrypted data and the initialization vector (IV) in localStorage.
// Retrieve the encrypted data from localStorage and decrypt it using the same key and IV.



// Key Notes:
// AES - GCM: In this example, AES - GCM(Galois / Counter Mode) is used because it is a widely supported and secure symmetric encryption mode.
// Initialization Vector(IV): The IV is randomly generated for each encryption operation.It is needed to decrypt the data, so it is stored along with the encrypted data.
// Key Management: In a real - world application, you'd need to securely handle the encryption key (e.g., store it securely on the server or use a key derivation method).
// LocalStorage: Even though the data is encrypted, avoid storing very sensitive information in localStorage if possible, due to potential vulnerabilities like XSS.



async function generateKey() {
    const key = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,  // 256-bit key
        },
        true,  // Can be exported
        ["encrypt", "decrypt"]  // Usages
    );
    return key;
}


async function encryptData(key, data) {
    const encodedData = new TextEncoder().encode(data);  // Convert string to byte array
    const iv = window.crypto.getRandomValues(new Uint8Array(12));  // 12-byte IV for AES-GCM

    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv  // Initialization vector
        },
        key,  // AES key
        encodedData  // Data to encrypt
    );

    return { encryptedData, iv };
}


async function decryptData(key, encryptedData, iv) {
    const decryptedData = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encryptedData
    );

    const decodedData = new TextDecoder().decode(decryptedData);  // Convert byte array back to string
    return decodedData;
}



function saveToLocalStorage(encryptedData, iv) {
    localStorage.setItem('encryptedData', btoa(String.fromCharCode(...new Uint8Array(encryptedData))));
    localStorage.setItem('iv', btoa(String.fromCharCode(...new Uint8Array(iv))));
}


function getFromLocalStorage() {
    const encryptedData = new Uint8Array(atob(localStorage.getItem('encryptedData')).split('').map(c => c.charCodeAt(0)));
    const iv = new Uint8Array(atob(localStorage.getItem('iv')).split('').map(c => c.charCodeAt(0)));
    return { encryptedData, iv };
}



// (async function () {
//     // Generate a new key
//     const key = await generateKey();

//     // Example user data to encrypt
//     const userData = JSON.stringify({ username: 'user1', email: 'user1@example.com' });

//     // Encrypt the user data
//     const { encryptedData, iv } = await encryptData(key, userData);

//     // Store the encrypted data and IV in localStorage
//     saveToLocalStorage(encryptedData, iv);

//     // Retrieve the encrypted data and IV from localStorage
//     const { encryptedData: storedEncryptedData, iv: storedIv } = getFromLocalStorage();

//     // Decrypt the data
//     const decryptedData = await decryptData(key, storedEncryptedData, storedIv);

//     console.log('Decrypted Data:', decryptedData);  // Output the decrypted user data
// })();
