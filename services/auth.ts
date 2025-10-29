import bcrypt from "bcryptjs";
import { storageService } from "./storage";

bcrypt.setRandomFallback((len: number) => {
  const randoms = Array.from({ length: len }, () =>
    Math.floor(Math.random() * 256)
  );
  return randoms;
});

export interface SessionUser {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
}

let currentUser: SessionUser | null = null;

export const authService = {
  async signup(email: string, password: string, name: string): Promise<void> {
    if (!name?.trim()) throw new Error("Name is required");
    if (!email?.trim()) throw new Error("Email is required");
    if (
      !password ||
      typeof password !== "string" ||
      password.trim().length === 0
    ) {
      throw new Error("Password must be a non-empty string");
    }

    const saltRounds = 12;
    const hashedPassword = await new Promise<string>((resolve, reject) => {
      bcrypt.hash(
        password,
        saltRounds,
        (err: Error | null, hash: string | undefined) => {
          if (err || !hash) reject(new Error("Password hashing failed"));
          else resolve(hash);
        }
      );
    });

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await storageService.createUser({
      _id: userId,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      password: hashedPassword,
      avatar: undefined,
    });
  },

  async login(email: string, password: string): Promise<SessionUser> {
    const user = await storageService.getUserByEmail(email);
    if (!user) throw new Error("Invalid email or password");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error("Invalid email or password");

    const sessionUser: SessionUser = {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };
    currentUser = sessionUser;
    await storageService.storeSession(sessionUser);
    return sessionUser;
  },

  async logout(): Promise<void> {
    currentUser = null;
    await storageService.clearSession();
  },

  async getCurrentUser(): Promise<SessionUser | null> {
    if (currentUser) return currentUser;
    const stored = await storageService.getStoredSession();
    if (stored) {
      currentUser = stored;
      return stored;
    }
    return null;
  },

  async getUserProfile(userId: string) {
    return storageService.getUserById(userId);
  },

  async updateUserProfile(userId: string, updates: any) {
    const updated = await storageService.updateUser(userId, updates);
    if (currentUser && currentUser._id === userId) {
      currentUser = { ...currentUser, ...updates };
      await storageService.storeSession(currentUser);
    }
    return updated;
  },
};
