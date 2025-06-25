# AuthApp

A React Native Expo application that implements persistent email/password authentication with Firebase and user profiles stored in Cloud Firestore. Provides a Login/Signup flow, password reset, and account settings screens.

## Prerequisites

* Node.js (v14 or newer)
* npm or Yarn
* Expo CLI (available via `npx expo`)
* A Firebase account

## Installation

1. **Clone the repository**

   ```bash
   git clone <YOUR_REPO_URL>
   cd AuthApp
   ```

2. **Install dependencies**

   ```bash
   npm install
   # Install Expo native modules
   npx expo install expo-constants @react-native-async-storage/async-storage
   ```

3. **Configure Firebase**

   1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
   2. Under **Authentication → Sign-in method**, enable **Email/Password**.
   3. Under **Firestore Database**, click **Create database**, choose a location, and start in **Test mode** or **Production mode**.
   4. In **Firestore → Rules**, use:

      ```js
      service cloud.firestore {
        match /databases/{database}/documents {
          match /users/{userId} {
            allow create: if request.auth != null && request.auth.uid == userId;
            allow read, update, delete: if request.auth != null && request.auth.uid == userId;
          }
        }
      }
      ```
   5. Under **Project Settings → Your apps**, register a **Web** app and copy the Firebase config.

4. **Create `.env` file**
   In the project root, create `.env` and add your Firebase config values:

   ```env
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

   > Ensure `.env` is in `.gitignore` to keep your keys private.

5. **Update `app.config.js`**
   Make sure `app.config.js` reads from `process.env` and exposes them via `expo-constants`:

   ```js
   import 'dotenv/config';
   export default {
     expo: {
       name: 'AuthApp',
       slug: 'AuthApp',
       extra: {
         firebaseApiKey: process.env.FIREBASE_API_KEY,
         firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
         firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
         firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
         firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
         firebaseAppId: process.env.FIREBASE_APP_ID,
       },
     },
   };
   ```

6. **Run the app**

   ```bash
   npx expo start
   ```

   * Press `a` for Android
   * Press `i` for iOS
   * Press `w` for Web

## Project Structure

```
AuthApp/
├── src/
│   ├── firebase/
│   │   └── config.ts             # Firebase initialization (Auth & Firestore)
│   └── screens/
│       ├── LandingScreen.tsx     # Welcome with Login/Create
│       ├── LoginScreen.tsx       # Email/Password login
│       ├── SignupScreen.tsx      # Email/Password signup
│       ├── ResetPasswordScreen.tsx # Password reset flow
│       ├── AccountSettingsScreen.tsx # Edit profile, change email/password
│       └── HomeScreen.tsx        # Authenticated home
├── App.tsx                       # Root entrypoint
├── app.config.js                 # Expo config loading .env
├── .env                          # Firebase keys (ignored)
├── package.json
└── README.md
```

## Environment Variables

Exposed via Expo Constants in code (`Constants.expoConfig.extra`):

* `firebaseApiKey`
* `firebaseAuthDomain`
* `firebaseProjectId`
* `firebaseStorageBucket`
* `firebaseMessagingSenderId`
* `firebaseAppId`
