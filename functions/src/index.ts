// /**
//  * Import function triggers from their respective submodules:
//  *
//  * import {onCall} from "firebase-functions/v2/https";
//  * import {onDocumentWritten} from "firebase-functions/v2/firestore";
//  *
//  * See a full list of supported triggers at https://firebase.google.com/docs/functions
//  */

// import { onRequest } from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript

// // export const helloWorld = onRequest((request, response) => {
// //   logger.info("Hello logs!", {structuredData: true});
// //   response.send("Hello from Firebase!");
// // });

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {exec} from "child_process";

admin.initializeApp();

// Define the backup Firestore function
export const backupFirestore = functions.https.onRequest((req, res) =>{
  const bucketName = "your-gcs-bucket";
  // Command to trigger Firestore export to Google Cloud Storage
  const exportCommand = `gcloud firestore export gs://${bucketName}`;

  exec(exportCommand, (error, stdout, stderr) =>{
    if (error) {
      console.error(`Error executing backup: ${error.message}`);
      res.status(500).send({
        message: "Backup failed",
        error: error.message,
      });
      return;
    }

    console.log(`Backup successful: ${stdout}`);
    res.status(200).send({
      message: "Backup started successfully",
      details: stdout});
  });
});
