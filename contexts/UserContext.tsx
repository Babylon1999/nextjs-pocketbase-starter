"use client";

import { getToken, PB_URL, clearToken } from "@/lib/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created: string;
  updated: string;
  [key: string]: any; // Allow additional properties from PocketBase
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${PB_URL}/api/collections/users/auth-refresh`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear user state and sign out
          setUser(null);
          setError(null);
          clearToken(); // Clear the token from cookies
          window.dispatchEvent(new Event("auth-change")); // Notify other components
          return;
        }
        // Don't show toast for auth failures as it's handled by individual pages
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      const userData = data.record;

      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        created: userData.created,
        updated: userData.updated,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setUser(null);

      // Set error for network errors - toast should be handled by components
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("Network")
      ) {
        setError(
          "Unable to connect to the server. Please check your internet connection."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearUser = () => {
    setUser(null);
    setError(null);
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Listen for auth changes (login/logout)
  useEffect(() => {
    const handleAuthChange = () => {
      fetchUser();
    };

    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  const value: UserContextType = {
    user,
    isLoading,
    error,
    refreshUser: fetchUser,
    clearUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
