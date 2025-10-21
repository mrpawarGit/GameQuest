import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign in was cancelled");
    } else if (error.code === "auth/popup-blocked") {
      throw new Error("Popup was blocked by browser");
    } else {
      throw new Error("Failed to sign in with Google");
    }
  }
};

// Sign out
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// User data interface
interface UserData {
  username: string;
  highScore: number;
  lastPlayed: string;
}

// Save user high score to Firestore
export const saveHighScore = async (
  userId: string,
  score: number,
  username: string
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists() || score > (userDoc.data()?.highScore || 0)) {
      await setDoc(
        userRef,
        {
          username,
          highScore: score,
          lastPlayed: new Date().toISOString(),
        },
        { merge: true }
      );
      console.log(`High score ${score} saved for user ${username}`);
    }
  } catch (error) {
    console.error("Error saving high score:", error);
    throw error;
  }
};

// Get user high score from Firestore
export const getUserHighScore = async (userId: string): Promise<number> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const data = userDoc.data() as UserData;
      return data?.highScore || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error getting high score:", error);
    return 0;
  }
};

// Get user data from Firestore
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Auth state listener
export const onAuthStateChange = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};
