import * as admin from "firebase-admin";

if (!admin.apps.length) {
    try {
        // Validate required environment variables
        const requiredEnvVars = {
            FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
            FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
            FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        };

        const missingVars = Object.entries(requiredEnvVars)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingVars.length > 0) {
            throw new Error(
                `Missing required Firebase Admin environment variables: ${missingVars.join(", ")}\n` +
                `Please check your .env.local file.`
            );
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: requiredEnvVars.FIREBASE_PROJECT_ID!,
                clientEmail: requiredEnvVars.FIREBASE_CLIENT_EMAIL!,
                privateKey: requiredEnvVars.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
            }),
        });

        console.log("✅ Firebase Admin SDK initialized successfully");
    } catch (error) {
        console.error("❌ Firebase Admin initialization error:", error);

        // In production, throw the error to prevent app from running with broken admin features
        if (process.env.NODE_ENV === "production") {
            throw error;
        }
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export default admin;
