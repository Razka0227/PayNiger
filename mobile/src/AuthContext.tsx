import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { api, apiError, clearSession, getStoredUser, saveSession, SessionUser } from './api';
import { COLORS } from './theme';

interface LoginResult {
  requires2fa: boolean;
  challengeToken?: string;
  devCode?: string;
}

interface AuthCtx {
  user: SessionUser | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<LoginResult>;
  verify2fa: (challengeToken: string, code: string) => Promise<void>;
  register: (data: { phone: string; fullName: string; password: string; pin: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const login = async (phone: string, password: string): Promise<LoginResult> => {
    const { data } = await api.post('/auth/login', { phone, password });
    if (data.requiresTwoFactor)
      return { requires2fa: true, challengeToken: data.challengeToken, devCode: data.devCode };
    await saveSession(data);
    setUser(data.user);
    return { requires2fa: false };
  };

  const verify2fa = async (challengeToken: string, code: string) => {
    const { data } = await api.post('/auth/2fa/verify', { challengeToken, code });
    await saveSession(data);
    setUser(data.user);
  };

  const register = async (input: { phone: string; fullName: string; password: string; pin: string }) => {
    const { data } = await api.post('/auth/register', input);
    await saveSession(data);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // session locale quand même effacée
    }
    await clearSession();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, verify2fa, register, logout }}>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        children
      )}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth hors AuthProvider');
  return ctx;
}

export { apiError };
