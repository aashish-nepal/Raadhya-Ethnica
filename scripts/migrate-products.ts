import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

// Initialize Firebase Admin
const serviceAccount = require(path.join(process.cwd(), "firebase-service-account.json"));

const app = initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore(app);

async function migrateProducts() {
    try {
        console.log("🚀 Starting product migration...");

        // Read products from JSON file
        const productsPath = path.join(process.cwd(), "src", "data", "products.json");
        const productsData = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

        console.log(`📦 Found ${productsData.length} products to migrate`);

        // Batch write products to Firestore
        const batch = db.batch();
        let count = 0;

        for (const product of productsData) {
            const productRef = db.collection("products").doc();

            // Convert date strings to Firestore timestamps
            const productData = {
                ...product,
                createdAt: new Date(product.createdAt || new Date()),
                updatedAt: new Date(product.updatedAt || new Date()),
            };

            batch.set(productRef, productData);
            count++;

            if (count % 10 === 0) {
                console.log(`✅ Queued ${count} products...`);
            }
        }

        // Commit the batch
        await batch.commit();
        console.log(`✨ Successfully migrated ${count} products to Firestore!`);

        // Create some sample orders for testing
        console.log("\\n📝 Creating sample orders...");
        await createSampleOrders();

        // Create sample customers
        console.log("\\n👥 Creating sample customers...");
        await createSampleCustomers();

        console.log("\\n🎉 Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error during migration:", error);
        process.exit(1);
    }
}

async function createSampleOrders() {
    const sampleOrders = [
        {
            orderNumber: "ORD-001",
            userId: "sample-user-1",
            items: [
                {
                    productId: "1",
                    productName: "Elegant Pink Cotton Kurta",
                    productImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800",
                    quantity: 2,
                    size: "M",
                    color: "Pink",
                    price: 1299,
                    total: 2598,
                },
            ],
            subtotal: 2598,
            discount: 0,
            shipping: 50,
            tax: 0,
            total: 2648,
            shippingAddress: {
                name: "Sarah Johnson",
                phone: "+91 98765 43210",
                addressLine1: "123 Main Street",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400001",
                isDefault: true,
            },
            billingAddress: {
                name: "Sarah Johnson",
                phone: "+91 98765 43210",
                addressLine1: "123 Main Street",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400001",
                isDefault: true,
            },
            paymentMethod: "razorpay",
            paymentStatus: "paid",
            orderStatus: "delivered",
            createdAt: new Date("2024-02-10"),
            updatedAt: new Date("2024-02-14"),
        },
        {
            orderNumber: "ORD-002",
            userId: "sample-user-2",
            items: [
                {
                    productId: "2",
                    productName: "Designer Embroidered Blue Kurta",
                    productImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
                    quantity: 1,
                    size: "L",
                    color: "Blue",
                    price: 2499,
                    total: 2499,
                },
            ],
            subtotal: 2499,
            discount: 0,
            shipping: 50,
            tax: 0,
            total: 2549,
            shippingAddress: {
                name: "Emily Davis",
                phone: "+91 98765 43211",
                addressLine1: "456 Park Avenue",
                city: "Delhi",
                state: "Delhi",
                pincode: "110001",
                isDefault: true,
            },
            billingAddress: {
                name: "Emily Davis",
                phone: "+91 98765 43211",
                addressLine1: "456 Park Avenue",
                city: "Delhi",
                state: "Delhi",
                pincode: "110001",
                isDefault: true,
            },
            paymentMethod: "razorpay",
            paymentStatus: "paid",
            orderStatus: "processing",
            createdAt: new Date("2024-02-14"),
            updatedAt: new Date("2024-02-14"),
        },
        {
            orderNumber: "ORD-003",
            userId: "sample-user-3",
            items: [
                {
                    productId: "3",
                    productName: "Festive Golden Yellow Kurta",
                    productImage: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800",
                    quantity: 1,
                    size: "M",
                    color: "Golden Yellow",
                    price: 1799,
                    total: 1799,
                },
            ],
            subtotal: 1799,
            discount: 0,
            shipping: 50,
            tax: 0,
            total: 1849,
            shippingAddress: {
                name: "Jessica Brown",
                phone: "+91 98765 43212",
                addressLine1: "789 Lake Road",
                city: "Bangalore",
                state: "Karnataka",
                pincode: "560001",
                isDefault: true,
            },
            billingAddress: {
                name: "Jessica Brown",
                phone: "+91 98765 43212",
                addressLine1: "789 Lake Road",
                city: "Bangalore",
                state: "Karnataka",
                pincode: "560001",
                isDefault: true,
            },
            paymentMethod: "razorpay",
            paymentStatus: "paid",
            orderStatus: "shipped",
            createdAt: new Date("2024-02-13"),
            updatedAt: new Date("2024-02-14"),
        },
    ];

    for (const order of sampleOrders) {
        await db.collection("orders").add(order);
    }

    console.log(`✅ Created ${sampleOrders.length} sample orders`);
}

async function createSampleCustomers() {
    const sampleCustomers = [
        {
            name: "Sarah Johnson",
            email: "sarah@example.com",
            phone: "+91 98765 43210",
            role: "customer",
            totalOrders: 5,
            totalSpent: 8500,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-02-14"),
        },
        {
            name: "Emily Davis",
            email: "emily@example.com",
            phone: "+91 98765 43211",
            role: "customer",
            totalOrders: 3,
            totalSpent: 5200,
            createdAt: new Date("2024-01-20"),
            updatedAt: new Date("2024-02-14"),
        },
        {
            name: "Jessica Brown",
            email: "jessica@example.com",
            phone: "+91 98765 43212",
            role: "customer",
            totalOrders: 7,
            totalSpent: 12300,
            createdAt: new Date("2024-01-10"),
            updatedAt: new Date("2024-02-14"),
        },
        {
            name: "Admin User",
            email: "admin@raadhyaethnica.com",
            phone: "+91 98765 00000",
            role: "admin",
            totalOrders: 0,
            totalSpent: 0,
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-02-14"),
        },
    ];

    for (const customer of sampleCustomers) {
        await db.collection("customers").add(customer);
    }

    console.log(`✅ Created ${sampleCustomers.length} sample customers`);
}

// Run migration
migrateProducts();
