# Admin Authentication Setup Guide

## Overview

The admin panel now uses Firebase Authentication with role-based access control. Only users with the "admin" role in Firestore can access admin features.

## Quick Start

### 1. Create an Admin User

First, create a user account in Firebase Authentication (if not already exists):

**Option A: Via Firebase Console**
1. Go to Firebase Console → Authentication → Users
2. Click "Add User"
3. Enter email and password
4. Click "Add User"

**Option B: Via Registration Flow**
1. Use your app's registration page to create an account
2. Note the email address used

### 2. Promote User to Admin

Run the promotion script with the user's email:

```bash
npm run promote-admin -- admin@raadhyaethnica.com
```

This script will:
- Find the user in Firebase Auth
- Create/update their entry in Firestore customers collection
- Set their role to "admin"
- Add custom claims for additional security

### 3. Login to Admin Panel

1. Navigate to `/admin/login`
2. Enter the admin email and password
3. You'll be redirected to the admin dashboard

## Authentication Flow

```
User visits /admin → Layout checks auth → Not authenticated → Redirect to /admin/login
                                      → Authenticated but not admin → Redirect to /
                                      → Authenticated and admin → Show admin panel
```

## Features

### ✅ Implemented

- **Firebase Authentication Integration**
  - Email/password login
  - Secure session management
  - Automatic token refresh

- **Role-Based Access Control**
  - Admin role stored in Firestore
  - Custom claims in Firebase Auth
  - Server-side role verification

- **Protected Routes**
  - All `/admin/*` routes require authentication
  - Automatic redirect to login if not authenticated
  - Redirect to home if authenticated but not admin

- **Admin Layout Features**
  - User info display in header
  - Logout button
  - Loading states
  - Automatic auth state management

- **Admin Promotion Script**
  - Command-line tool to promote users
  - Validates email format
  - Creates Firestore entry if needed
  - Sets custom claims

## File Structure

```
src/
├── lib/
│   └── auth-admin.ts          # Admin authentication utilities
├── app/
│   └── admin/
│       ├── layout.tsx          # Protected admin layout
│       └── login/
│           └── page.tsx        # Admin login page
scripts/
└── promote-admin.ts            # User promotion script
```

## Security Considerations

### Current Implementation

1. **Client-Side Protection**
   - Admin layout checks authentication state
   - Redirects unauthenticated users to login
   - Verifies admin role before rendering

2. **Firestore Role Storage**
   - Admin role stored in customers collection
   - Queried on every auth state change
   - Custom claims for additional verification

### Recommended Enhancements

1. **Firestore Security Rules**
   ```javascript
   // Only admins can write to products
   match /products/{productId} {
     allow read: if true;
     allow write: if request.auth != null && 
       get(/databases/$(database)/documents/customers/$(request.auth.uid)).data.role == 'admin';
   }
   ```

2. **API Route Protection**
   - Add server-side auth checks to API routes
   - Verify admin role before processing requests
   - Use Firebase Admin SDK for verification

3. **Session Timeout**
   - Implement automatic logout after inactivity
   - Refresh tokens periodically
   - Clear sensitive data on logout

## Troubleshooting

### "You do not have admin privileges" Error

**Cause**: User exists but doesn't have admin role

**Solution**:
```bash
npm run promote-admin -- user@example.com
```

### "User not found" Error

**Cause**: User doesn't exist in Firebase Auth

**Solution**:
1. Create user in Firebase Console
2. Or register via app's registration flow
3. Then run promote-admin script

### Can't Access Admin Panel After Login

**Possible Causes**:
1. Role not properly set in Firestore
2. Browser cache issues
3. Firebase session expired

**Solutions**:
1. Check Firestore customers collection for user's role
2. Clear browser cache and cookies
3. Re-run promote-admin script
4. Try logging out and back in

### Infinite Redirect Loop

**Cause**: Authentication state not properly initialized

**Solution**:
1. Clear browser cache
2. Check browser console for errors
3. Verify Firebase configuration in `.env.local`
4. Restart development server

## Testing

### Test Authentication Flow

1. **Unauthenticated Access**
   ```
   Open /admin → Should redirect to /admin/login
   ```

2. **Non-Admin Login**
   ```
   Login with regular user → Should show "no admin privileges" error
   ```

3. **Admin Login**
   ```
   Login with admin user → Should redirect to /admin dashboard
   ```

4. **Logout**
   ```
   Click logout → Should redirect to /admin/login
   Try accessing /admin → Should redirect to /admin/login
   ```

### Verify Protection

1. Open incognito window
2. Try to access `/admin/products`
3. Should redirect to `/admin/login`
4. Login with admin credentials
5. Should redirect back and show products page

## Next Steps

1. **Apply Firestore Security Rules**
   - Copy rules from implementation plan
   - Test in Firebase Console
   - Deploy to production

2. **Add API Route Protection**
   - Create middleware for API routes
   - Verify admin role server-side
   - Return 403 for unauthorized requests

3. **Implement Session Management**
   - Add session timeout
   - Implement remember me
   - Add activity tracking

4. **Enhanced Security**
   - Add rate limiting on login
   - Implement 2FA (optional)
   - Add audit logging for admin actions

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Firebase configuration
3. Check Firestore for user data
4. Review authentication flow in code
