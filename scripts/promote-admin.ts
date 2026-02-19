import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read service account key
const serviceAccountPath = join(__dirname, "..", "firebase-service-account.json");
let serviceAccount;

try {
    const serviceAccountData = readFileSync(serviceAccountPath, "utf8");
    serviceAccount = JSON.parse(serviceAccountData);
} catch (error: any) {
    console.error("❌ Error reading firebase-service-account.json");
    console.log("\n💡 Please download your Firebase service account key:");
    console.log("1. Go to Firebase Console → Project Settings → Service Accounts");
    console.log("2. Click 'Generate New Private Key'");
    console.log("3. Save as 'firebase-service-account.json' in the project root");
    process.exit(1);
}

// Initialize Firebase Admin
const app = initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore(app);
const auth = getAuth(app);

async function promoteToAdmin(email: string) {
    try {
        console.log(`🔍 Looking for user with email: ${email}`);

        // Get user by email from Firebase Auth
        const userRecord = await auth.getUserByEmail(email);
        console.log(`✅ Found user: ${userRecord.uid}`);

        // Find user in Firestore customers collection
        const customersRef = db.collection("customers");
        const snapshot = await customersRef.where("email", "==", email).get();

        if (snapshot.empty) {
            console.log("📝 User not found in customers collection, creating entry...");

            // Create customer entry
            await customersRef.add({
                id: userRecord.uid,
                email: userRecord.email,
                name: userRecord.displayName || email.split("@")[0],
                role: "admin",
                totalOrders: 0,
                totalSpent: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            console.log("✅ Created admin user in customers collection");
        } else {
            // Update existing user to admin
            const userDoc = snapshot.docs[0];
            await userDoc.ref.update({
                role: "admin",
                updatedAt: new Date(),
            });

            console.log("✅ Updated user role to admin");
        }

        // Set custom claims (optional, for additional security)
        await auth.setCustomUserClaims(userRecord.uid, { admin: true });
        console.log("✅ Set admin custom claims");

        console.log(`\n🎉 Successfully promoted ${email} to admin!`);
        console.log(`\nUser can now log in at: /admin/login`);

        process.exit(0);
    } catch (error: any) {
        console.error("❌ Error promoting user to admin:", error.message);

        if (error.code === "auth/user-not-found") {
            console.log("\n💡 User doesn't exist in Firebase Auth.");
            console.log("Please create the user first:");
            console.log("1. Go to Firebase Console → Authentication → Users");
            console.log("2. Click 'Add User'");
            console.log("3. Enter email and password");
            console.log("4. Run this script again");
        }

        process.exit(1);
    }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
    console.error("❌ Please provide an email address");
    console.log("\nUsage: npm run promote-admin -- user@example.com");
    process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    console.error("❌ Invalid email format");
    process.exit(1);
}

// Run promotion
promoteToAdmin(email);
