# Anise Frontend (React Native / Expo)

Anise is a modern, mobile-first app for creating and managing DAOs (Decentralized Autonomous Organizations) with a beautiful, intuitive onboarding experience. Built with React Native and Expo, Anise guides users from first launch through onboarding, authentication, and DAO creation using customizable off-chain JSON templates.

---

## How the Frontend Works

### **User Flow**
1. **Welcome Splash**: On first launch, users see a multi-page welcome splash introducing the app.
2. **Landing Page**: After the splash, users land on a page with two options: **Log In** or **Create Account**.
3. **Authentication**: Users can log in, sign up, or reset their password. All authentication is handled by the backend (no direct Firebase SDK usage in the frontend).
4. **Main App**: After login, users see a bottom tab navigator with the main app screens: MyAnises, Explore, Create, Notifications, Profile.
5. **Logout**: The logout button is only on the Profile screen. Logging out returns the user to the landing page.
6. **Persistent Login**: The app checks for a valid token on launch and refreshes it if needed.

---

## GoCardless Payments & Linking

- **Linking Flow:**
  - Users can link their bank account for payments via GoCardless from the Profile page.
  - Tapping "Link GoCardless" opens a flow where the user is redirected to a GoCardless-hosted form, pre-filled with their name and email.
  - After completing the form, the app confirms the link and stores the GoCardless mandate in the backend (and shows the status in the Profile page).
  - The Profile page will automatically update to show the linked status and mandate ID after linking.

- **Debug/Test Payments:**
  - After linking, users can create test payments and subscriptions directly from the linking flow page for development/debugging.
  - Results and errors are shown in-app for easy troubleshooting.

- **Backend-Driven:**
  - All GoCardless flows are handled via backend APIs. The frontend never talks directly to GoCardless.
  - The backend manages user-mandate association, payment creation, and webhook handling.

- **UI Integration:**
  - The Profile page shows the current GoCardless status and allows linking if not already linked.
  - After linking, the user can manage or test payments from the same flow.

---

## **Navigation Structure**
- **Splash → Landing → (Login | Signup | Reset) → Main App Tabs**
- All navigation is managed in `App.tsx` using a `screen` state variable.
- The landing page buttons always work, and all screens can link to each other as expected.

---

## **Connecting to the Backend (ngrok Setup)**

The frontend talks to the backend via a REST API. If you are running the backend locally, you must expose it to the internet using [ngrok](https://ngrok.com/) so the mobile app can reach it.

### **How to set up ngrok:**
1. **Start your backend server locally** (e.g., in `aniseBackend/`).
2. **Start ngrok** to tunnel your backend port (e.g., 3001):
   ```bash
   ngrok http 3001
   ```
3. **Copy the HTTPS URL** that ngrok gives you (e.g., `https://xxxx-xxx-xxx-xxx.ngrok-free.app`).
4. **Update the frontend API base URL**:
   - Open `aniseProject/src/utils/api.ts`.
   - Change the value of `API_BASE_URL` to your ngrok URL:
     ```js
     export const API_BASE_URL = "https://xxxx-xxx-xxx-xxx.ngrok-free.app";
     ```
5. **Save and restart the Expo app** if needed.

**Note:** If you restart ngrok, the URL will change. You must update `api.ts` each time.

---

## **Firebase API Key**

The frontend needs your Firebase Web API key to refresh tokens. This is **public** and safe to include in the frontend.

- The key is stored in `aniseProject/src/utils/firebase.ts`:
     ```js
  export const FIREBASE_API_KEY = "your_firebase_api_key";
     ```
- If you use a different Firebase project, update this value to match your project's Web API key (found in Firebase Console → Project Settings → General → Web API Key).

---

## **Setup & Installation**

1. **Clone the repository**
   ```bash
   git clone <YOUR_REPO_URL>
   cd anise/aniseProject
   ```
2. **Install dependencies**
   ```bash
   npm install
   npx expo install expo-constants @react-native-async-storage/async-storage expo-linear-gradient react-native-pager-view
   ```
3. **Configure ngrok and API base URL** (see above)
4. **Configure Firebase API key** (see above)
5. **Run the app**
   ```bash
   npx expo start
   ```

---

## **Project Structure (Key Files)**

- `App.tsx`: Handles onboarding, navigation, authentication state, and persistent login.
- `src/screens/landing/WelcomeSplashScreens.tsx`: Multi-page welcome splash.
- `src/screens/landing/LandingScreen.tsx`: Landing page with Log In / Create Account buttons.
- `src/screens/auth/`: Login, Signup, and Reset Password screens.
- `src/Navigation.tsx`: Main tab navigator for the app.
- `src/utils/api.ts`: Set your backend API base URL here.
- `src/utils/firebase.ts`: Set your Firebase Web API key here.

---

## **Troubleshooting**
- If the app can't connect to the backend, check that:
  - Your backend is running and reachable from the internet (ngrok is active).
  - The `API_BASE_URL` in `src/utils/api.ts` matches your current ngrok URL.
- If authentication fails, check your backend logs and ensure the Firebase API key is correct.
- If you change the backend or ngrok URL, restart the Expo app.

---

## **Contributing**
- Please keep all API keys and URLs in the appropriate utility files.
- Do not commit sensitive keys to public repositories.
- For new screens or features, follow the existing navigation and state management patterns in `App.tsx`.

---

## **Contact**
For questions or help, contact the maintainers or open an issue.
