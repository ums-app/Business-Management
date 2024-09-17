// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth'
import { getStorage } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCziOTx9MPI7m1VRAxCMb44AJTaXjaeQVE",
    authDomain: "business-management-341ff.firebaseapp.com",
    projectId: "business-management-341ff",
    storageBucket: "business-management-341ff.appspot.com",
    messagingSenderId: "1501269496",
    appId: "1:1501269496:web:99f8af3483861265681a0d",
    measurementId: "G-B4N1EER8YF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app)


// const admin = require('firebase-admin');
// admin.initializeApp({
//     credential: admin.credential.applicationDefault(), // or use a service account key
//     // databaseURL: "https://<YOUR_PROJECT_ID>.firebaseio.com"
// });