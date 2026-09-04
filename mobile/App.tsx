import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './src/AuthContext';
import { COLORS } from './src/theme';
import { BillsScreen } from './src/screens/BillsScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { TransferScreen } from './src/screens/TransferScreen';
import { TwoFactorScreen } from './src/screens/TwoFactorScreen';

type Tab = 'login' | 'register' | 'twofa' | 'home' | 'transfer' | 'bills';

function Root() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [challenge, setChallenge] = useState<{ token?: string; devCode?: string }>({});

  const goto = (screen: Tab, challengeToken?: string, devCode?: string) => {
    setChallenge({ token: challengeToken, devCode });
    setTab(screen);
  };

  const target: Tab = user ? tab : tab === 'register' || tab === 'twofa' ? tab : 'login';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1 }}>
        {target === 'login' && <LoginScreen onNavigate={goto} />}
        {target === 'register' && <RegisterScreen onNavigate={(s) => goto(s)} />}
        {target === 'twofa' && (
          <TwoFactorScreen challengeToken={challenge.token} devCode={challenge.devCode} onNavigate={(s) => goto(s)} />
        )}
        {target === 'home' && <DashboardScreen onNavigate={(s) => goto(s)} />}
        {target === 'transfer' && <TransferScreen onBack={() => goto('home')} />}
        {target === 'bills' && <BillsScreen onBack={() => goto('home')} />}
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
});
