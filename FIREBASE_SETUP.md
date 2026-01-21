# Firebase Setup Troubleshooting Guide

## ❌ Error: "Could not reach Cloud Firestore backend"

This error means your app can't connect to Firebase Firestore. Here's how to fix it:

---

## ✅ Step 1: Verify Firestore is Enabled

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **moja-4ca11**
3. Click on **"Firestore Database"** in the left sidebar
4. If you see **"Create database"** button, click it and follow these steps:
   - Choose **"Start in test mode"** (for development)
   - Select a location (choose closest to you, e.g., `us-central`)
   - Click **"Enable"**

---

## ✅ Step 2: Set Up Firestore Security Rules

After enabling Firestore, set up security rules:

1. In Firebase Console → Firestore Database → **Rules** tab
2. Replace the rules with this (for development):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all events
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow users to read/write their own tickets
    match /tickets/{ticketId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Allow users to read/write their own user document
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

---

## ✅ Step 3: Enable Authentication

1. In Firebase Console → **Authentication** → **Get Started**
2. Click on **"Email/Password"** under Sign-in method
3. **Enable** the toggle
4. Click **"Save"**

---

## ✅ Step 4: Check Your Internet Connection

- Make sure you have a stable internet connection
- Try disabling VPN if you're using one
- Check if your firewall is blocking Firebase domains

---

## ✅ Step 5: Verify Environment Variables

Make sure your `.env.local` file has all the correct values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD9eXwSKq_edLZ3VibE-Ow_9wJ4YtcUte8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=moja-4ca11.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=moja-4ca11
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=moja-4ca11.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=897872936744
NEXT_PUBLIC_FIREBASE_APP_ID=1:897872936744:web:aae0bcbb4b9bb9c9719a1d
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-7RB7D1F7B9
```

---

## ✅ Step 6: Restart Development Server

After making changes:

1. Stop the dev server (Ctrl+C in terminal)
2. Clear Next.js cache:
   ```bash
   rm -rf .next
   ```
3. Restart:
   ```bash
   npm run dev
   ```

---

## 🔍 Additional Checks

### Check if Firestore is accessible:

Open your browser console (F12) and look for:
- ✅ `"✅ Firestore initialized successfully"`
- ✅ `"🔥 Firebase initialized with project: moja-4ca11"`

### Common Issues:

1. **"Missing or insufficient permissions"**
   - Your Firestore rules are too restrictive
   - Update rules as shown in Step 2

2. **"Firebase: Error (auth/configuration-not-found)"**
   - Authentication not enabled
   - Follow Step 3

3. **"Network request failed"**
   - Internet connection issue
   - Firewall blocking Firebase
   - Try disabling antivirus temporarily

---

## 📝 Test Connection

After setup, test by:

1. Opening your app: http://localhost:3000
2. Check browser console for Firebase logs
3. Try creating an account
4. Try viewing events

---

## 🆘 Still Having Issues?

If the error persists:

1. Check Firebase Console → **Usage** tab to see if requests are being made
2. Look at **Firestore → Data** tab to verify database exists
3. Check browser Network tab (F12) for failed requests to `firestore.googleapis.com`

---

## 📚 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
