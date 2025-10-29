// contexts/AuthContext.tsx
import { authService, SessionUser } from "@/services/auth";
import { User } from "@/services/storage"; // Import User from storage
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: SessionUser | null;
  profile: User | null;
  loading: boolean;
  error: string | null; // Added error state
  signin: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  signout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(null as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Error state

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear errors on load
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      if (currentUser?._id) {
        const userProfile = await authService.getUserProfile(currentUser._id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Load user data error:", error);
      setError("Failed to load user data");
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const signin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null); // Clear errors on signin
      const sessionUser = await authService.login(email, password);
      setUser(sessionUser);

      const userProfile = await authService.getUserProfile(sessionUser._id);
      setProfile(userProfile);
    } catch (error: any) {
      console.error("Signin error:", error);
      setError(error.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.signup(email, password, name);
      // ✅ No auto-login, do not setUser/setProfile here.
    } catch (error: any) {
      console.error("Register error:", error);
      setError(error.message || "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signout = async () => {
    try {
      setLoading(true);
      setError(null); // Clear errors on signout
      await authService.logout();
      setUser(null);
      setProfile(null);
    } catch (error: any) {
      console.error("Signout error:", error);
      setError(error.message || "Logout failed");
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      setError(null); // Clear errors on update
      const updatedProfile = await authService.updateUserProfile(
        user._id,
        updates
      );
      setProfile(updatedProfile);
      setUser({ ...user, ...updates });
    } catch (error: any) {
      console.error("Update profile error:", error);
      setError(error.message || "Profile update failed");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error, // Include error in context
        signin,
        register,
        signout,
        refresh: loadUserData,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
