import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../hooks/useAuth';
import { colors, radius, spacing, typography } from '../../theme';

export function LoginScreen() {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = isRegisterMode ? register : login;

  const handleSubmit = () => {
    if (!email.trim() || !password) {
      Toast.show({ type: 'error', text1: 'Completá email y contraseña' });
      return;
    }

    mutation.mutate(
      { email: email.trim(), password },
      {
        onError: (error: unknown) => {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message ?? 'Ocurrió un error, intentá de nuevo';
          Toast.show({ type: 'error', text1: String(message) });
        },
      },
    );
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.logo}>VEYA</Text>
          <Text style={styles.subtitle}>
            {isRegisterMode ? 'Creá tu cuenta' : 'Iniciá sesión para continuar'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
            onPress={handleSubmit}
            disabled={mutation.isPending}
          >
            <Text style={styles.submitLabel}>
              {mutation.isPending
                ? 'Cargando…'
                : isRegisterMode
                  ? 'Crear cuenta'
                  : 'Entrar'}
            </Text>
          </Pressable>

          <Pressable onPress={() => setIsRegisterMode((v) => !v)}>
            <Text style={styles.toggleText}>
              {isRegisterMode
                ? '¿Ya tenés cuenta? Iniciá sesión'
                : '¿No tenés cuenta? Registrate'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logo: {
    ...typography.title,
    fontSize: 36,
    letterSpacing: 4,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  submitLabel: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  toggleText: {
    color: colors.accent,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
