import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const API_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://10.0.2.2:3000/api/v1';

const TOKEN_KEY = 'pn_access';
const REFRESH_KEY = 'pn_refresh';
const USER_KEY = 'pn_user';

export const api = axios.create({ baseURL: API_URL, timeout: 20_000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface SessionUser {
  id: string;
  fullName: string;
  role: string;
  kycTier: number;
  phone: string;
}

export async function saveSession(data: { accessToken: string; refreshToken: string; user: SessionUser }) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, data.accessToken],
    [REFRESH_KEY, data.refreshToken],
    [USER_KEY, JSON.stringify(data.user)],
  ]);
}

export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, USER_KEY]);
}

export async function getStoredUser(): Promise<SessionUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function apiError(err: unknown): string {
  const e = err as AxiosError<{ message?: string }>;
  const m = e?.response?.data?.message;
  return Array.isArray(m) ? m.join(', ') : m ?? e?.message ?? 'Erreur réseau';
}
