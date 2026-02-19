# Firestore Security Rules Deployment Guide

## The Issue

The error `FirebaseError: Missing or insufficient permissions` means your Firestore database is blocking the client-side code from reading the `customers` collection to check admin roles.

## Quick Fix

### Option 1: Deploy via Firebase Console (Recommended - Fastest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Replace the existing rules with the content from `firestore.rules`
5. Click **"Publish"**
6. Wait a few seconds for the rules to deploy
7. Try logging in again - it should work immediately!

### Option 2: Deploy via Firebase CLI

If you have Firebase CLI installed:

```bash
firebase deploy --only firestore:rules
```

## The Rules

The key rule that fixes the authentication issue:

```javascript
match /customers/{customerId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}
```

This allows any authenticated user to read the customers collection, which is necessary for the admin role check to work.

## Security Note

Currently, any authenticated user can read all customer data. After confirming admin login works, we can tighten this to:

```javascript
match /customers/{customerId} {
  // Users can only read their own data OR if they're admin
  allow read: if request.auth != null && 
    (customerId == request.auth.uid || 
     get(/databases/$(database)/documents/customers/$(request.auth.uid)).data.role == 'admin');
  allow write: if request.auth != null && customerId == request.auth.uid;
}
```

But this creates a chicken-and-egg problem for the initial admin check, so we'll use the simpler rule for now.

## After Deploying

1. Wait 5-10 seconds for rules to propagate
2. Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)
3. Try logging in at `/admin/login`
4. You should see in the console:
   ```
   ✅ Firebase Auth successful
   🔍 Checking admin role for email: admin@raadhyaethnica.com
   Found user with email: admin@raadhyaethnica.com role: admin
   👤 Admin status: true
   ✅ Admin login successful!
   ```
5. You'll be redirected to the admin dashboard!
