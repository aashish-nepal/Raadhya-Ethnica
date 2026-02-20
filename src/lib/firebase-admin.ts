import * as admin from "firebase-admin";

// Singleton guard — only initialize once across hot-reloads in dev
if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Firebase Admin SDK is missing required environment variables.\n" +
            "Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in .env.local"
        );
    }

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            // .env stores escaped newlines as \\n — convert to real newlines
            privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
    });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export default admin;
