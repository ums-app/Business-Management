// // firebase-messaging-sw.js (in the public folder)
// importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js');
// // firebase-messaging-sw.js
// importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js');

// const firebaseConfig = {
//     apiKey: "AIzaSyCziOTx9MPI7m1VRAxCMb44AJTaXjaeQVE",
//     authDomain: "business-management-341ff.firebaseapp.com",
//     projectId: "business-management-341ff",
//     storageBucket: "business-management-341ff.appspot.com",
//     messagingSenderId: "1501269496",
//     appId: "1:1501269496:web:99f8af3483861265681a0d",
//     measurementId: "G-B4N1EER8YF"
// };

// firebase.initializeApp(firebaseConfig);
// const messaging = firebase.messaging();

// // Handle background messages
// messaging.onBackgroundMessage((payload) => {
//     console.log('Received background message ', payload);
//     const notificationTitle = payload.notification.title;
//     const notificationOptions = {
//         body: payload.notification.body,
//         icon: '/firebase-logo.png', // Replace with your app icon
//     };

//     self.registration.showNotification(notificationTitle, notificationOptions);
// });
