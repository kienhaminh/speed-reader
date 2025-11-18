/**
 * Simple client-side authentication utilities using local storage
 * For demo purposes with hardcoded admin credentials
 */

const SESSION_KEY = 'speed-reader-session';

export interface AuthSession {
  username: string;
  loginTime: number;
}

/**
 * Hardcoded credentials for demo
 */
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

/**
 * Authenticate user with hardcoded credentials
 */
export function authenticate(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const session: AuthSession = {
      username,
      loginTime: Date.now(),
    };

    // Save to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return true;
  }

  return false;
}

/**
 * Get current session from local storage
 */
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const sessionData = localStorage.getItem(SESSION_KEY);

  if (!sessionData) {
    return null;
  }

  try {
    return JSON.parse(sessionData) as AuthSession;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Logout user by clearing session
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}
