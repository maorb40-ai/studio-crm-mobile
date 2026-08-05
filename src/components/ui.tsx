// רכיבי UI בסיסיים ומשותפים - בלי ספריית עיצוב חיצונית (כדי לא להוסיף עוד
// תלות נייטיבית שאי אפשר לבדוק בבנייה מראש) - רק React Native רגיל, בהתאם
// לפלטת הצבעים ב-src/theme.ts.
import React from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, ActivityIndicator, TextInputProps } from 'react-native';
import { colors } from '../theme';

export function ScreenContainer({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function AppText({ children, muted, bold, style }: { children: React.ReactNode; muted?: boolean; bold?: boolean; style?: any }) {
  return <Text style={[styles.text, muted && styles.textMuted, bold && styles.textBold, style]}>{children}</Text>;
}

export function ScreenTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function AppButton({
  title,
  onPress,
  secondary,
  danger,
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        secondary && styles.buttonSecondary,
        danger && styles.buttonDanger,
        (disabled || loading) && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function AppTextInput(props: TextInputProps & { label?: string }) {
  return (
    <View style={styles.fieldRow}>
      {props.label ? <Text style={styles.label}>{props.label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        {...props}
        style={[styles.input, props.style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  card: {
    backgroundColor: colors.charcoal,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12, textAlign: 'right' },
  text: { color: colors.text, fontSize: 15, textAlign: 'right' },
  textMuted: { color: colors.textMuted, fontSize: 13 },
  textBold: { fontWeight: '700' },
  button: {
    backgroundColor: colors.navy,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 4,
  },
  buttonSecondary: { backgroundColor: colors.greyLight },
  buttonDanger: { backgroundColor: colors.danger },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  buttonTextSecondary: { color: colors.text },
  fieldRow: { marginBottom: 10 },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: 4, textAlign: 'right' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.text,
    backgroundColor: colors.charcoalDark,
    fontSize: 15,
    textAlign: 'right',
  },
});
