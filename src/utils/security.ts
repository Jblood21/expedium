/**
 * Security utilities for Expedium
 * Handles password hashing, input sanitization, rate limiting, and secure ID generation
 */

// Simple hash function for passwords (SHA-256 based)
// Note: In production, use a backend with bcrypt/argon2
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'expedium_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Verify password against hash
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

// Generate cryptographically secure random ID
export const generateSecureId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Rate limiter for login attempts
interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

const rateLimitStore: Map<string, RateLimitEntry> = new Map();

const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 30 * 60 * 1000, // 30 minutes lockout after max attempts
};

export const checkRateLimit = (identifier: string): { allowed: boolean; message: string; remainingAttempts?: number } => {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    rateLimitStore.set(identifier, { attempts: 0, lastAttempt: now, lockedUntil: null });
    return { allowed: true, message: '', remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts };
  }

  // Check if locked out
  if (entry.lockedUntil && now < entry.lockedUntil) {
    const remainingMinutes = Math.ceil((entry.lockedUntil - now) / 60000);
    return {
      allowed: false,
      message: `Too many failed attempts. Please try again in ${remainingMinutes} minutes.`
    };
  }

  // Reset if window has passed
  if (now - entry.lastAttempt > RATE_LIMIT_CONFIG.windowMs) {
    entry.attempts = 0;
    entry.lockedUntil = null;
  }

  return {
    allowed: true,
    message: '',
    remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts - entry.attempts
  };
};

export const recordLoginAttempt = (identifier: string, success: boolean): void => {
  const now = Date.now();
  let entry = rateLimitStore.get(identifier);

  if (!entry) {
    entry = { attempts: 0, lastAttempt: now, lockedUntil: null };
    rateLimitStore.set(identifier, entry);
  }

  if (success) {
    // Reset on successful login
    entry.attempts = 0;
    entry.lockedUntil = null;
  } else {
    entry.attempts++;
    entry.lastAttempt = now;

    if (entry.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
      entry.lockedUntil = now + RATE_LIMIT_CONFIG.lockoutMs;
    }
  }
};

// Password strength validation
export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
}

export const validatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Use at least 8 characters');
  }

  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Include lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Include uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Include numbers');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Include special characters');
  }

  // Check for common patterns
  const commonPatterns = ['password', '123456', 'qwerty', 'abc123', 'admin'];
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common passwords');
  }

  return {
    isValid: score >= 3 && password.length >= 8,
    score: Math.min(score, 4),
    feedback
  };
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Validate import data structure
export const validateImportData = (data: unknown): { valid: boolean; error?: string } => {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: 'Invalid data format' };
  }

  const obj = data as Record<string, unknown>;

  // Check that all keys start with expedium_
  for (const key of Object.keys(obj)) {
    if (!key.startsWith('expedium_')) {
      return { valid: false, error: 'Invalid data keys detected' };
    }

    // Check for potentially dangerous content
    const value = JSON.stringify(obj[key]);
    if (value.includes('<script') || value.includes('javascript:') || value.includes('onerror=')) {
      return { valid: false, error: 'Potentially malicious content detected' };
    }
  }

  return { valid: true };
};

// Session management
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export interface Session {
  userId: string;
  createdAt: number;
  lastActivity: number;
}

export const createSession = (userId: string): Session => {
  const now = Date.now();
  return {
    userId,
    createdAt: now,
    lastActivity: now
  };
};

export const isSessionValid = (session: Session | null): boolean => {
  if (!session) return false;

  const now = Date.now();
  const isExpired = now - session.lastActivity > SESSION_TIMEOUT;

  return !isExpired;
};

export const updateSessionActivity = (session: Session): Session => {
  return {
    ...session,
    lastActivity: Date.now()
  };
};

// Secure localStorage wrapper
export const secureStorage = {
  setItem: (key: string, value: unknown): void => {
    try {
      const sanitizedValue = typeof value === 'string'
        ? value
        : JSON.stringify(value);
      localStorage.setItem(key, sanitizedValue);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },

  getItem: <T>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to remove from localStorage:', e);
    }
  }
};
