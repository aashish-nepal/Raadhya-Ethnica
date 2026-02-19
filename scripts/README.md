# Firebase Admin Integration - Migration Guide

## Overview

This script migrates your existing product data from `src/data/products.json` to Firestore and creates sample orders and customers for testing the admin panel.

## Prerequisites

1. **Firebase Service Account Key**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `firebase-service-account.json` in the project root
   - **IMPORTANT**: Add this file to `.gitignore` (already done)

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Running the Migration

### Option 1: Using npm script (Recommended)
```bash
npm run migrate-products
```

### Option 2: Using ts-node directly
```bash
npx ts-node scripts/migrate-products.ts
```

## What Gets Migrated

### 1. Products
- All products from `src/data/products.json`
- Converts date strings to Firestore timestamps
- Preserves all product data (images, colors, sizes, etc.)

### 2. Sample Orders (3 orders)
- Order #1: Delivered order from Feb 10
- Order #2: Processing order from Feb 14
- Order #3: Shipped order from Feb 13

### 3. Sample Customers (4 customers)
- 3 regular customers with order history
- 1 admin user (admin@raadhyaethnica.com)

## After Migration

1. **Verify Data in Firebase Console**
   - Go to Firestore Database
   - Check `products`, `orders`, and `customers` collections

2. **Test Admin Panel**
   - Navigate to `/admin` in your app
   - Dashboard should show real-time statistics
   - Products page should list all migrated products
   - Orders page should show sample orders
   - Customers page should display sample customers

3. **Set Admin User**
   - The migration creates an admin user with email: `admin@raadhyaethnica.com`
   - You can use this for testing admin authentication

## Firestore Security Rules

After migration, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - Read by all, write by admin only
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/customers/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders - Read/write by owner or admin
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                    (resource.data.userId == request.auth.uid || 
                     get(/databases/$(database)/documents/customers/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                      get(/databases/$(database)/documents/customers/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Customers - Read/write own data or admin can read all
    match /customers/{customerId} {
      allow read: if request.auth != null && 
                    (customerId == request.auth.uid || 
                     get(/databases/$(database)/documents/customers/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && customerId == request.auth.uid;
    }
    
    // Reviews - Read by all, write by authenticated users
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Newsletter - Create only
    match /newsletter/{subscriberId} {
      allow create: if true;
    }
    
    // Coupons - Read by all, write by admin only
    match /coupons/{couponId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/customers/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Troubleshooting

### Error: "Cannot find module 'firebase-service-account.json'"
- Make sure you've downloaded the service account key from Firebase Console
- Place it in the project root directory
- File name must be exactly `firebase-service-account.json`

### Error: "Permission denied"
- Check that your Firebase service account has the correct permissions
- Ensure Firestore is enabled in your Firebase project

### Products not showing in admin panel
- Check browser console for errors
- Verify Firebase configuration in `.env.local`
- Ensure Firestore security rules allow reading products

## Re-running the Migration

⚠️ **WARNING**: Running the migration multiple times will create duplicate data.

If you need to re-run:
1. Delete all documents in Firestore collections first
2. Or modify the script to check for existing data

## Next Steps

After successful migration:

1. **Test Real-time Updates**
   - Open admin dashboard in two browser tabs
   - Update an order status in one tab
   - Verify it updates in the other tab automatically

2. **Add More Data**
   - Use the admin panel to add more products
   - Create test orders through the checkout flow
   - Register new customers

3. **Set Up Admin Authentication**
   - Implement admin login with Firebase Auth
   - Use custom claims to mark users as admins
   - Protect admin routes with middleware

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify all environment variables are set correctly
3. Ensure Firebase project is properly configured
