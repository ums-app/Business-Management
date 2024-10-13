/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


const functions = require('firebase-functions');
const { exec } = require('child_process');

exports.backupFirestore = functions.https.onRequest((req, res) => {
    const bucketName = 'your-gcs-bucket'; // Replace with your GCS bucket

    const command = `gcloud firestore export gs://${bucketName}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Backup failed: ${error}`);
            res.status(500).send('Backup failed.');
            return;
        }
        console.log(`Backup successful: ${stdout}`);
        res.status(200).send('Backup started successfully.');
    });
});
