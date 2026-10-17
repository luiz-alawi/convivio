import type { AuthResponse, LoginInput, RegisterCompanyInput, RegisterInput } from '@convivio/shared';
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, setAuthToken, setUnauthorizedHandler } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';

const TOKEN_KEY = 'convivio.token';

type Status = 'loading' | 'signedIn' | 'signedOut';

interface AuthContextValue {
  status: Status;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signUpCompany: (input: RegisterCompanyInput) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY)
      .then((token) => {
        setAuthToken(token);
        setStatus(token ? 'signedIn' : 'signedOut');
      })
      .catch(() => setStatus('signedOut'));
  }, []);

  const startSession = useCallback(async ({ token, user }: AuthResponse) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setAuthToken(token);
    queryClient.setQueryData(['me'], user);
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthToken(null);
    queryClient.clear();
    setStatus('signedOut');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      signIn: async (input) => startSession(await api<AuthResponse>('/auth/login', { method: 'POST', body: input })),
      signUp: async (input) =>
        startSession(await api<AuthResponse>('/auth/register', { method: 'POST', body: input })),
      signUpCompany: async (input) =>
        startSession(await api<AuthResponse>('/auth/register-company', { method: 'POST', body: input })),
      signOut,
    }),
    [status, startSession, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return context;
}
