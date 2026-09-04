import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { apiError, useAuth } from '../AuthContext';
import { Alert, Button, Field, Screen } from '../components/ui';
import { COLORS, TYPO } from '../theme';

export function RegisterScreen({ onNavigate }: { onNavigate: (screen: 'login') => void }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await register({ fullName, phone, password, pin });
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Créer un compte" subtitle="Deux minutes suffisent.">
      <View style={styles.card}>
        <Alert kind="error">{error}</Alert>
        <Field label="Nom complet" value={fullName} onChangeText={setFullName} />
        <Field label="Numéro de téléphone" value={phone} onChangeText={setPhone} keyboardType="numeric" placeholder="+227 90 00 00 00" />
        <Field label="Mot de passe (8+ caractères)" value={password} onChangeText={setPassword} secure />
        <Field label="Code PIN de transaction (4 chiffres)" value={pin} onChangeText={setPin} keyboardType="numeric" secure />
        <Button title={busy ? 'Création…' : 'Créer mon compte PayNiger'} onPress={submit} disabled={busy} />
        <Button title="Retour à la connexion" onPress={() => onNavigate('login')} variant="ghost" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border },
});
