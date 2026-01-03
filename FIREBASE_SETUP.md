# Firebase Setup Instructions

To enable cross-device synchronization for access codes and exam results, you need to set up Firebase Firestore.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard (you can disable Google Analytics if not needed)

## Step 2: Enable Firestore

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Start in **production mode** (we'll set up security rules)
4. Choose a location closest to your users
5. Click "Enable"

## Step 3: Set Up Security Rules

1. Go to "Firestore Database" > "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to results collection
    match /results/{resultId} {
      allow read, write: if true;
    }
    
    // Allow read/write to usedCodes collection
    match /usedCodes/{code} {
      allow read, write: if true;
    }
  }
}
```

**Note:** These rules allow public access. For production, you should add authentication and proper security rules.

## Step 4: Get Firebase Configuration

1. Go to Project Settings (gear icon) > General tab
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register your app with a nickname (e.g., "Nova Academy Mock Exam")
5. Copy the `firebaseConfig` object

## Step 5: Update firebase.ts

Open `firebase.ts` and replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 6: Test the Setup

1. Start your development server: `npm run dev`
2. Try submitting an exam - it should save to Firestore
3. Check Firebase Console > Firestore Database to see the data
4. Try accessing from another device/browser - the access code should be marked as used

## How It Works

- **Results Collection**: Stores all exam results with timestamps
- **usedCodes Collection**: Tracks which access codes have been used
- **Real-time Updates**: Admin dashboard automatically updates when new results are submitted from any device

## Collections Structure

### results
```
{
  id: string (auto-generated)
  name: string
  course: string
  track: string
  accessCode: string
  score: number
  totalPossible: number
  timestamp: Timestamp
  answers: object
}
```

### usedCodes
```
{
  code: string (document ID = access code)
  usedAt: Timestamp
  resultId: string
}
```

## Troubleshooting

- **Import errors**: Make sure Firebase is installed: `npm install firebase`
- **Permission errors**: Check Firestore security rules
- **Connection errors**: Verify your Firebase config in `firebase.ts`
- **"Client is offline" error**: 
  - Make sure you've enabled Firestore Database in Firebase Console
  - Go to Firestore Database and click "Create database" if you haven't already
  - Check your internet connection
  - The app will fallback to localStorage if Firestore is unavailable, but cross-device sync won't work
- **Offline mode**: The app now includes offline persistence, so it will work even when offline and sync when connection is restored

