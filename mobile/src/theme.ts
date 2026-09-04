export const COLORS = {
  primary: '#0B6E4F',
  primaryDark: '#08523B',
  accent: '#F4A825',
  danger: '#C63D2F',
  bg: '#F5F7F6',
  card: '#FFFFFF',
  border: '#E2E8E6',
  text: '#10201B',
  muted: '#5C6F67',
  success: '#1B8A5A',
};

export const TYPO = {
  h1: { fontSize: 24, fontWeight: '800' as const, color: COLORS.text },
  h2: { fontSize: 18, fontWeight: '700' as const, color: COLORS.text },
  body: { fontSize: 15, color: COLORS.text },
  small: { fontSize: 12.5, color: COLORS.muted },
  mono: { fontSize: 15, fontWeight: '700' as const, color: COLORS.primary },
};

export function formatFcfa(amount: number | string): string {
  return `${Number(amount).toLocaleString('fr-FR')} FCFA`;
}
