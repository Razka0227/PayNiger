import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api, apiError } from '../api';
import { Alert, Button, Card, Field, Screen } from '../components/ui';
import { COLORS, TYPO, formatFcfa } from '../theme';

export function TransferScreen({ onBack }: { onBack: () => void }) {
  const [toPhone, setToPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const amountCents = Math.round(Number(amount));
      if (!amountCents || amountCents < 50) throw new Error('Montant invalide');
      const { data } = await api.post('/transactions/p2p', { toPhone, amountCents, pin });
      setSuccess(`Transfert réussi — ${data.transaction.reference}`);
      setPin('');
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Transférer" subtitle="Envoyez de l'argent à un autre numéro PayNiger.">
      <Card>
        <Alert kind="error">{error}</Alert>
        <Alert kind="info">{success}</Alert>
        <Field label="Numéro du destinataire" value={toPhone} onChangeText={setToPhone} keyboardType="numeric" placeholder="+227 90 00 00 00" />
        <Field label="Montant (FCFA)" value={amount} onChangeText={setAmount} keyboardType="numeric" hint="Frais : 1% si KYC ≥ 1, sinon 2%." />
        <Field label="Code PIN" value={pin} onChangeText={setPin} keyboardType="numeric" secure />
        <Button title={busy ? 'Envoi…' : `Envoyer ${amount ? formatFcfa(Number(amount)) : ''}`} onPress={submit} disabled={busy} />
        <Button title="Retour" onPress={onBack} variant="ghost" />
        <Text style={TYPO.small}>💡 Le transfert est instantané et idempotent : une double soumission ne crée pas de doublon.</Text>
      </Card>
    </Screen>
  );
}
