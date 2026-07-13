import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, setAuthToken, LoginPayload, RegisterPayload } from '../api';

type Role = 'student' | 'advisor' | 'admin';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
}

interface AppContextType {
  currentUser: AppUser | null;
  loginWithCredentials: (payload: LoginPayload) => Promise<AppUser>;
  registerAndLogin: (payload: RegisterPayload) => Promise<AppUser>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AppContext = createContext<AppContextType>({
  currentUser: null,
  loginWithCredentials: async () => ({ id: '', email: '', name: '', role: 'student', emailVerified: false }),
  registerAndLogin: async () => ({ id: '', email: '', name: '', role: 'student', emailVerified: false }),
  logout: () => {},
  isAuthenticated: false,
});

const STORAGE_KEY = 'study-compass-auth-token';

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    setCurrentUser(null);
  };

  const normalizeUser = (user: { id: string; email: string; fullName: string; role: string; emailVerified: boolean }): AppUser => ({
    id: user.id,
    email: user.email,
    name: user.fullName,
    role: user.role.toLowerCase() as Role,
    emailVerified: user.emailVerified,
  });

  const handleAuthSuccess = async (token: string, user: { id: string; email: string; fullName: string; role: string; emailVerified: boolean }): Promise<AppUser> => {
    const normalizedUser = normalizeUser(user);
    localStorage.setItem(STORAGE_KEY, token);
    setAuthToken(token);
    setCurrentUser(normalizedUser);
    return normalizedUser;
  };

  const loginWithCredentials = async (payload: LoginPayload): Promise<AppUser> => {
    const response = await authApi.login(payload);
    const result = response.data.data;
    return handleAuthSuccess(result.token, result.user);
  };

  const registerAndLogin = async (payload: RegisterPayload): Promise<AppUser> => {
    const response = await authApi.register(payload);
    const result = response.data.data;
    return handleAuthSuccess(result.token, result.user);
  };

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) return;

    const loadUser = async () => {
      try {
        setAuthToken(token);
        const response = await authApi.me();
        setCurrentUser(normalizeUser(response.data.data));
      } catch (err: any) {
        // Only clear the session for genuine auth failures (invalid/expired token).
        // Network errors, 5xx, etc. should NOT log the user out.
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          logout();
        } else {
          // Token may still be valid — restore it even if /me failed
          setAuthToken(token);
        }
      }
    };

    loadUser();
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        loginWithCredentials,
        registerAndLogin,
        logout,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
