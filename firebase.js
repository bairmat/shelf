import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBe9dS--uYI_ivxt0F5hZUv1WulHlvQqxc",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "shelf-app-bacs488",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "861883879832",
    appId: "1:861883879832:ios:f514a47fe626c9bb1e1bed"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { app, auth, db, storage };
