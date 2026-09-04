import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { apiError, useAuth } from '../AuthContext';
import { Alert, Button, Field, Screen } from '../components/ui';
import { COLORS, TYPO } from '../theme';

export function TwoFactorScreen({
  challengeToken,
  devCode,
  onNavigate,
}: {
  challengeToken?: string;
  devCode?: string;
  onNavigate: (screen: 'login') => void;
}) {
  const { verify2fa } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!challengeToken) return setError('Session expirée. Reconnectez-vous.');
    setBusy(true);
    setError(null);
    try {
      await verify2fa(challengeToken, code);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Vérification en 2 étapes" subtitle="Code SMS requis pour sécuriser l'accès.">
      <View style={styles.card}>
        {devCode ? (
          <View style={styles.dev}>
            <Text style={{ color: COLORS.primaryDark, fontWeight: '700' }}>Mode démo : code = {devCode}</Text>
          </View>
        ) : null}
        <Alert kind="error">{error}</Alert>
        <Field label="Code à 6 chiffres" value={code} onChangeText={setCode} keyboardType="numeric" placeholder="000000" />
        <Button title={busy ? 'Vérification…' : 'Vérifier'} onPress={submit} disabled={busy} />
        <Button title="Revenir à la connexion" onPress={() => onNavigate('login')} variant="ghost" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  dev: { backgroundColor: '#E8F4EF', borderRadius: 10, padding: 10, marginBottom: 12 },
});
