import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api, apiError } from '../api';
import { useAuth } from '../AuthContext';
import { Alert, Button, Card, Screen } from '../components/ui';
import { COLORS, TYPO, formatFcfa } from '../theme';
import { TRANSACTION_TYPE_LABELS } from '@payniger/shared';

interface Wallet {
  provider: string;
  accountNumber: string;
  balanceCents: number;
  isPrimary: boolean;
}
interface Txn {
  id: string;
  reference: string;
  type: string;
  status: string;
  amountCents: number;
  description?: string;
  createdAt: string;
}

export function DashboardScreen({ onNavigate }: { onNavigate: (s: 'transfer' | 'bills') => void }) {
  const { user, logout } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [me, list] = await Promise.all([api.get('/users/me'), api.get('/transactions?pageSize=8')]);
      setWallets(me.data.wallets);
      setTxns(list.data.items);
    } catch (e) {
      setError(apiError(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = wallets.reduce((s, w) => s + Number(w.balanceCents), 0);

  return (
    <Screen
      title={`Bonjour, ${user?.fullName?.split(' ')[0] ?? ''}`}
      subtitle="Votre portefeuille unifié"
      right={
        <Button title="Déconnexion" onPress={logout} variant="ghost" />
      }
    >
      <Alert kind="error">{error}</Alert>
      <View style={styles.balanceCard}>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Solde total</Text>
        <Text style={styles.balance}>{formatFcfa(total)}</Text>
        <View style={styles.actions}>
          <Button title="Transférer" onPress={() => onNavigate('transfer')} />
          <Button title="Payer une facture" onPress={() => onNavigate('bills')} />
        </View>
      </View>

      <Card>
        <Text style={[TYPO.h2, { marginBottom: 10 }]}>Mes wallets</Text>
        {wallets.map((w) => (
          <View key={w.provider} style={styles.walletRow}>
            <View>
              <Text style={{ fontWeight: '700', color: COLORS.text }}>{w.provider}</Text>
              <Text style={TYPO.small}>•••• {w.accountNumber.slice(-6)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={TYPO.mono}>{formatFcfa(w.balanceCents)}</Text>
              {w.isPrimary ? <Text style={[TYPO.small, { color: COLORS.primary }]}>principal</Text> : null}
            </View>
          </View>
        ))}
      </Card>

      <Text style={[TYPO.h2, { marginBottom: 8 }]}>
        Dernières transactions{' '}
        <Text style={{ color: COLORS.primary }} onPress={load}>
          (actualiser)
        </Text>
      </Text>
      <Card style={{ marginBottom: 0 }}>
        {txns.length === 0 && <Text style={TYPO.small}>Aucune transaction.</Text>}
        {txns.slice(0, 6).map((t) => (
          <View key={t.id} style={styles.txnRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: COLORS.text }}>
                {TRANSACTION_TYPE_LABELS[t.type as keyof typeof TRANSACTION_TYPE_LABELS] ?? t.type}
              </Text>
              <Text style={TYPO.small}>{t.reference}</Text>
            </View>
            <Text style={{ color: t.status === 'SUCCESS' ? COLORS.success : COLORS.danger, fontWeight: '700' }}>
              {t.status === 'SUCCESS' ? '+' : ''}
              {formatFcfa(t.amountCents)}
            </Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
  },
  balance: { color: '#fff', fontSize: 30, fontWeight: '800', marginVertical: 6 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  txnRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
});
