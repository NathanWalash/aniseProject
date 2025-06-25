# Anise

Anise is a modern, mobile-first app for creating and managing DAOs (Decentralized Autonomous Organizations) with a beautiful, intuitive onboarding experience. Built with React Native and Expo, Anise guides users from first launch through onboarding, authentication, and DAO creation using customizable off-chain JSON templates.

---

## What is Anise?

- **Onboarding-first:** New users are greeted with a multi-page welcome splash, introducing the app and its features.
- **Authentication:** Secure email/password login and signup, with persistent sessions and password reset, powered by Firebase Auth.
- **DAO Creation Wizard:** Users can create new DAOs using a step-by-step wizard, selecting from off-chain JSON templates and customizing parameters before deployment.
- **Profile & Account:** Users can manage their profile, account settings, and see their DAOs.
- **Modern UI:** Uses NativeWind, gradients, SVG icons, and swipeable splash screens for a delightful experience.

---

## Navigation Bar Structure

Anise uses a bottom tab navigator for primary app navigation:

| Tab            | Icon                | Description                                                                 |
|----------------|---------------------|-----------------------------------------------------------------------------|
| MyAnises       | myanises_icon.svg   | View DAOs you have created or joined.                                       |
| Explore        | explore_icon.svg    | Discover public DAOs and templates.                                         |
| Create         | create_icon.svg     | Start the DAO creation wizard.                                              |
| Notifications  | notifications_icon.svg | View platform notifications and updates.                                 |
| Profile        | profile_icon.svg    | View and edit your profile, account settings, and preferences.              |

Each tab is implemented as a separate screen in `src/screens/`, and the navigation is set up in [`src/Navigation.tsx`](src/Navigation.tsx).

---

## Onboarding & Splash Screens

- **Welcome Splash:** On first launch (before login/signup), users see a 4-page welcome splash with swipeable pages, chevrons, and a "Get Started" button.
- **Create Wizard Splash:** When starting the DAO creation flow, users see a 3-page splash introducing the creation process.
- Both splash flows use gradients, swipe indicators, and a top-right close (X) button for a modern, mobile feel.

---

## DAO Creation Wizard & Off-chain JSON Templates

- The Create flow is a 3-step wizard:
  1. **Template Selection:** Choose a DAO template (e.g., Claims DAO, P2P Insurance) from a list loaded from an off-chain JSON file.
  2. **Configuration:** Fill in required parameters (e.g., admin address, quorum) as defined by the template's schema.
  3. **Review & Deploy:** Review your choices and "deploy" (currently simulated with a debug popup).
- **Templates:**
  - Stored in [`src/templates/aniseTemplates.json`](src/templates/aniseTemplates.json)
  - Each template defines a name, description, modules, and a schema for required parameters.
  - Example:
    ```json
    [
      {
        "templateName": "Claims DAO",
        "templateDescription": "A DAO with membership and claim voting",
        "modules": ["MemberModule", "ClaimVotingModule"],
        "initParamsSchema": [
          { "admin": "address" },
          { "quorum": "uint256" }
        ],
        "templateId": "claims-voting-v1"
      }
    ]
    ```
  - This approach allows rapid iteration and off-chain customization of available DAO types.

---

## Project Structure

```
aniseProject/
├── App.tsx
├── src/
│   ├── firebase/
│   │   └── config.ts
│   ├── Navigation.tsx
│   ├── templates/
│   │   └── aniseTemplates.json
│   └── screens/
│       ├── auth/
│       │   ├── LoginScreen.tsx
│       │   ├── SignupScreen.tsx
│       │   └── ResetPasswordScreen.tsx
│       ├── create/
│       │   ├── CreateScreen.tsx
│       │   ├── splash/
│       │   │   └── CreateSplashScreens.tsx
│       │   └── wizard/
│       │       ├── CreateWizard.tsx
│       │       ├── Step1TemplateSelect.tsx
│       │       ├── Step2Configure.tsx
│       │       └── Step3Review.tsx
│       ├── explore/
│       │   └── ExploreScreen.tsx
│       ├── landing/
│       │   ├── LandingScreen.tsx
│       │   └── WelcomeSplashScreens.tsx
│       ├── myanises/
│       │   └── MyAnisesScreen.tsx
│       ├── notifications/
│       │   └── NotificationsScreen.tsx
│       └── profile/
│           └── ProfileScreen.tsx
├── assets/
│   └── icons/
│       ├── create_icon.svg
│       ├── explore_icon.svg
│       ├── myanises_icon.svg
│       ├── notifications_icon.svg
│       └── profile_icon.svg
├── package.json
├── app.config.js
├── README.md
└── ...
```

---

## Off-chain JSON Templates

- All DAO templates are defined in [`src/templates/aniseTemplates.json`](src/templates/aniseTemplates.json).
- This file is loaded at runtime and used to populate the template selection step in the wizard.
- Each template can define its own modules and required parameters, making the system flexible and extensible without code changes.

---

## Firebase Setup & Environment Variables

To run Anise, you need a Firebase project and a `.env` file with your credentials.

1. **Create a Firebase Project**
   - Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
   - Under **Authentication → Sign-in method**, enable **Email/Password**.
   - Under **Firestore Database**, click **Create database**, choose a location, and start in **Test mode** or **Production mode**.
   - In **Firestore → Rules**, use:
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
   - Under **Project Settings → Your apps**, register a **Web** app and copy the Firebase config.

2. **Create a `.env` file**
   - In the project root, create a file named `.env` and add your Firebase config values:
     ```env
     FIREBASE_API_KEY=your_api_key
     FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     FIREBASE_PROJECT_ID=your_project_id
     FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     FIREBASE_APP_ID=your_app_id
     ```
   - **Important:** Ensure `.env` is in your `.gitignore` to keep your keys private.

3. **Update `app.config.js`**
   - Make sure `app.config.js` reads from `process.env` and exposes them via `expo-constants`:
     ```js
     import 'dotenv/config';
     export default {
       expo: {
         name: 'anise',
         slug: 'anise',
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

---

## Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_REPO_URL>
   cd aniseProject
   ```
2. **Install dependencies**
   ```bash
   npm install
   npx expo install expo-constants @react-native-async-storage/async-storage expo-linear-gradient react-native-pager-view
   ```
3. **Configure Firebase** (see previous instructions)
4. **Run the app**
   ```bash
   npx expo start
   ```

---

## Status & Roadmap

- [x] Onboarding splash screens
- [x] Persistent authentication (Firebase)
- [x] Bottom tab navigation with custom SVG icons
- [x] DAO creation wizard with off-chain JSON templates
- [x] Profile and account management
- [ ] On-chain deployment and wallet integration (coming soon)
- [ ] DAO discovery and social features (coming soon)

---

## Contributing

This project is a work in progress! PRs, issues, and feedback are welcome.

---

## License

MIT
