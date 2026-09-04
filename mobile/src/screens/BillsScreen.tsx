import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, apiError } from '../api';
import { Alert, Button, Card, Field, Screen } from '../components/ui';
import { COLORS, TYPO, formatFcfa } from '../theme';
import { BILL_OPERATOR_LABELS, BillOperator } from '@payniger/shared';

export function BillsScreen({ onBack }: { onBack: () => void }) {
  const [operators, setOperators] = useState<BillOperator[]>([]);
  const [operator, setOperator] = useState<BillOperator>('NIGELEC');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [customer, setCustomer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/bills/operators').then(({ data }) => {
      setOperators(data.operators.map((o: { operator: BillOperator }) => o.operator));
    });
  }, []);

  const check = async () => {
    setError(null);
    setCustomer(null);
    try {
      const { data } = await api.post('/bills/check', { operator, accountNumber });
      if (!data.valid) return setError(data.message ?? 'Contrat non trouvé');
      setCustomer(data.customerName ?? 'Contrat valide');
    } catch (e) {
      setError(apiError(e));
    }
  };

  const pay = async () => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const amountCents = Math.round(Number(amount));
      if (!amountCents || amountCents < 50) throw new Error('Montant invalide');
      const { data } = await api.post('/bills/pay', { operator, accountNumber, amountCents, pin });
      setSuccess(`Facture payée — ${data.transaction.reference}`);
      setPin('');
      setCustomer(null);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Payer des factures" subtitle="NIGELEC, SPEN, recharges mobiles…">
      <Card>
        <Text style={[TYPO.small, { fontWeight: '600', color: COLORS.text, marginBottom: 8 }]}>Émetteur</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {operators.map((op) => (
            <TouchableOpacity
              key={op}
              onPress={() => {
                setOperator(op);
                setCustomer(null);
              }}
              style={[styles.chip, operator === op && styles.chipActive]}
            >
              <Text style={{ color: operator === op ? '#fff' : COLORS.text, fontSize: 12.5, fontWeight: '600' }}>
                {BILL_OPERATOR_LABELS[op]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Alert kind="error">{error}</Alert>
        <Alert kind="info">{success}</Alert>
        <Field label="N° de contrat / compteur / téléphone" value={accountNumber} onChangeText={setAccountNumber} keyboardType="numeric" />
        <Button title="Vérifier le contrat" onPress={check} variant="ghost" />
        {customer ? <Text style={{ color: COLORS.success, marginBottom: 12 }}>✓ {customer}</Text> : null}
        <Field label="Montant (FCFA)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <Field label="Code PIN" value={pin} onChangeText={setPin} keyboardType="numeric" secure />
        <Button title={busy ? 'Paiement…' : `Payer ${amount ? formatFcfa(Number(amount)) : ''}`} onPress={pay} disabled={busy} />
        <Button title="Retour" onPress={onBack} variant="ghost" />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 7 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
});
