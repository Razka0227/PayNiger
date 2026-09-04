import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { apiError, useAuth } from '../AuthContext';
import { Alert, Button, Field, Screen } from '../components/ui';
import { COLORS, TYPO } from '../theme';

export function LoginScreen({ onNavigate }: { onNavigate: (screen: 'login' | 'register' | 'twofa', challengeToken?: string, devCode?: string) => void }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('+22792123456');
  const [password, setPassword] = useState('payniger123');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await login(phone, password);
      if (res.requires2fa) onNavigate('twofa', res.challengeToken, res.devCode);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="PayNiger" subtitle="Votre portefeuille mobile unifié" scroll={false} style={styles.center}>
      <View style={styles.card}>
        <Text style={TYPO.h2}>Connexion</Text>
        <Alert kind="error">{error}</Alert>
        <Field label="Numéro de téléphone" value={phone} onChangeText={setPhone} keyboardType="numeric" />
        <Field label="Mot de passe" value={password} onChangeText={setPassword} secure />
        <Button title={busy ? 'Connexion…' : 'Se connecter'} onPress={submit} disabled={busy} />
        <Button title="Créer un compte" onPress={() => onNavigate('register')} variant="ghost" />
        <Text style={[TYPO.small, { textAlign: 'center', marginTop: 6 }]}>
          Démo : Seydou +22792123456 (mdp payniger123)
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border },
});
