import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from 'react-native';
import { COLORS, TYPO } from '../theme';

export function Screen({
  title,
  subtitle,
  right,
  children,
  scroll = true,
  style,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}) {
  const inner = (
    <View style={styles.body}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={TYPO.h1}>{title}</Text>
          {subtitle ? <Text style={[TYPO.small, { marginTop: 4 }]}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
  return scroll ? (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={[styles.bg, style]}>
      {inner}
    </ScrollView>
  ) : (
    <View style={[styles.bg, { flex: 1 }, style]}>{inner}</View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  disabled,
  variant = 'solid',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'solid' | 'ghost';
}) {
  const solid = variant === 'solid';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        solid ? { backgroundColor: COLORS.primary } : { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.border },
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={[styles.btnText, { color: solid ? '#fff' : COLORS.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secure,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'numeric';
  secure?: boolean;
  hint?: string;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[TYPO.small, { marginBottom: 6, fontWeight: '600', color: COLORS.text }]}>{label}</Text>
      <TextInputView
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secure}
      />
      {hint ? <Text style={[TYPO.small, { marginTop: 4 }]}>{hint}</Text> : null}
    </View>
  );
}

function TextInputView(props: TextInputProps) {
  return <TextInput style={styles.input} placeholderTextColor="#94A79E" {...props} />;
}
export function Alert({ kind, children }: { kind: 'error' | 'info'; children: ReactNode }) {
  if (!children) return null;
  return (
    <View
      style={[
        styles.alert,
        kind === 'error' ? { backgroundColor: '#FDEBEA', borderColor: '#F3B6B0' } : { backgroundColor: '#E8F4EF', borderColor: '#BFE3D4' },
      ]}
    >
      <Text style={{ color: kind === 'error' ? COLORS.danger : COLORS.primaryDark, fontSize: 13.5 }}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: COLORS.bg },
  body: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 10 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  btnText: { fontWeight: '700', fontSize: 15.5 },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15.5,
    color: COLORS.text,
  },
  alert: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 14 },
});
