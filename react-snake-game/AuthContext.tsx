import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "firebase/auth";
import { onAuthStateChange } from "./firebase";

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  setIsGuest: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isGuest: false,
  loading: true,
  setIsGuest: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    isGuest,
    loading,
    setIsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
