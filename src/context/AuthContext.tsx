import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import {
  hashPassword,
  verifyPassword,
  generateSecureId,
  checkRateLimit,
  recordLoginAttempt,
  createSession,
  isSessionValid,
  updateSessionActivity,
  Session,
  secureStorage
} from '../utils/security';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password: string, name: string, company?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  company?: string;
  createdAt: number;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const checkSession = () => {
      const storedUser = secureStorage.getItem<User>('expedium_user');
      const session = secureStorage.getItem<Session>('expedium_session');

      if (storedUser && session && isSessionValid(session)) {
        setUser(storedUser);
        // Update session activity
        secureStorage.setItem('expedium_session', updateSessionActivity(session));
      } else if (storedUser) {
        // Session expired, clear user
        secureStorage.removeItem('expedium_user');
        secureStorage.removeItem('expedium_session');
      }
      setIsLoading(false);
    };

    checkSession();

    // Periodically check session validity
    const intervalId = setInterval(checkSession, 60000); // Every minute

    return () => clearInterval(intervalId);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limit
    const rateLimit = checkRateLimit(normalizedEmail);
    if (!rateLimit.allowed) {
      return { success: false, message: rateLimit.message };
    }

    const users = secureStorage.getItem<StoredUser[]>('expedium_users', []) || [];
    const foundUser = users.find((u: StoredUser) => u.email === normalizedEmail);

    if (!foundUser) {
      recordLoginAttempt(normalizedEmail, false);
      return { success: false, message: 'Invalid email or password' };
    }

    // Verify password - support both old (plain) and new (hashed) passwords
    let passwordValid = false;

    // Check if it's an old plain-text password (for migration)
    if (foundUser.passwordHash && !foundUser.passwordHash.includes('-')) {
      // New hashed password
      passwordValid = await verifyPassword(password, foundUser.passwordHash);
    } else if ((foundUser as unknown as { password?: string }).password) {
      // Old plain-text password - verify and migrate
      const oldPassword = (foundUser as unknown as { password: string }).password;
      if (oldPassword === password) {
        passwordValid = true;
        // Migrate to hashed password
        const newHash = await hashPassword(password);
        const updatedUsers = users.map((u: StoredUser) =>
          u.email === normalizedEmail
            ? { ...u, passwordHash: newHash, password: undefined }
            : u
        );
        secureStorage.setItem('expedium_users', updatedUsers);
      }
    }

    if (passwordValid) {
      recordLoginAttempt(normalizedEmail, true);

      const userWithoutPassword: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        company: foundUser.company
      };

      setUser(userWithoutPassword);
      secureStorage.setItem('expedium_user', userWithoutPassword);
      secureStorage.setItem('expedium_session', createSession(foundUser.id));

      return { success: true, message: 'Login successful' };
    }

    recordLoginAttempt(normalizedEmail, false);
    const remainingAttempts = checkRateLimit(normalizedEmail).remainingAttempts;
    return {
      success: false,
      message: remainingAttempts !== undefined && remainingAttempts <= 2
        ? `Invalid email or password. ${remainingAttempts} attempts remaining.`
        : 'Invalid email or password'
    };
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    company?: string
  ): Promise<{ success: boolean; message: string }> => {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    const users = secureStorage.getItem<StoredUser[]>('expedium_users', []) || [];
    const existingUser = users.find((u: StoredUser) => u.email === normalizedEmail);

    if (existingUser) {
      return { success: false, message: 'An account with this email already exists' };
    }

    // Hash password before storing
    const passwordHash = await hashPassword(password);

    const newUser: StoredUser = {
      id: generateSecureId(),
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      company: company?.trim(),
      createdAt: Date.now()
    };

    users.push(newUser);
    secureStorage.setItem('expedium_users', users);

    const userWithoutPassword: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      company: newUser.company
    };

    setUser(userWithoutPassword);
    secureStorage.setItem('expedium_user', userWithoutPassword);
    secureStorage.setItem('expedium_session', createSession(newUser.id));

    return { success: true, message: 'Registration successful' };
  };

  const logout = () => {
    setUser(null);
    secureStorage.removeItem('expedium_user');
    secureStorage.removeItem('expedium_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
