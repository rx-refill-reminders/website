import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getAuthUrl } from './oauth';
import { parseJwt } from './tokenUtils';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const ID_TOKEN_KEY = 'auth_id_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export interface User {
  sub?: string;
  email?: string;
  [key: string]: unknown;
}

export interface AuthTokens {
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  tokens: AuthTokens;
  login: (redirectPath?: string | null) => Promise<void>;
  logout: () => void;
  setAuthTokens: (accessToken: string, idToken: string, refreshToken?: string) => void;
  clearAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const clearAuthState = useCallback((): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ID_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);

    setAccessToken(null);
    setIdToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const setAuthTokens = useCallback(
    (nextAccessToken: string, nextIdToken: string, nextRefreshToken?: string): void => {
      localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken);
      localStorage.setItem(ID_TOKEN_KEY, nextIdToken);
      if (nextRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
      }

      setAccessToken(nextAccessToken);
      setIdToken(nextIdToken);
      setRefreshToken(nextRefreshToken || null);

      const parsed = parseJwt(nextIdToken) as User | null;
      setUser(parsed);
    },
    []
  );

  const login = useCallback(async (redirectPath: string | null = null): Promise<void> => {
    const authUrl = await getAuthUrl(redirectPath);
    window.location.href = authUrl;
  }, []);

  const logout = useCallback((): void => {
    clearAuthState();
    window.location.href = '/';
  }, [clearAuthState]);

  useEffect(() => {
    const storedAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedId = localStorage.getItem(ID_TOKEN_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (storedAccess && storedId) {
      setAccessToken(storedAccess);
      setIdToken(storedId);
      setRefreshToken(storedRefresh);
      setUser((parseJwt(storedId) as User | null) || null);
    }
  }, []);

  const tokens: AuthTokens = useMemo(
    () => ({ accessToken, idToken, refreshToken }),
    [accessToken, idToken, refreshToken]
  );

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(accessToken && idToken),
      tokens,
      login,
      logout,
      setAuthTokens,
      clearAuthState,
    }),
    [user, accessToken, idToken, tokens, login, logout, setAuthTokens, clearAuthState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

