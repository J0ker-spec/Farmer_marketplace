import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../hooks/useTranslation';
import { Routes } from '../../utils/routes';

export default function PhoneLoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }

    if (phone.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    const formattedPhone = `+232${phone.replace(/\s/g, '')}`;

    router.push({
      pathname: Routes.otpVerify as any,
      params: {
        phone: formattedPhone,
        role: params.role || 'buyer',
      },
    });

    setLoading(false);
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <View style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.text} />
            </View>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Ionicons name="call" size={28} color={Colors.white} />
            </View>
            <Text style={styles.title}>{t('auth.phoneLogin.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.phoneLogin.subtitle')}</Text>
          </View>

          <View style={styles.phoneInputContainer}>
            <Text style={styles.prefix}>+232</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="XX XXX XXX"
              placeholderTextColor={Colors.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={8}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={t('auth.phoneLogin.sendCode')}
            onPress={handleSendCode}
            loading={loading}
            disabled={loading}
          />

          <TouchableOpacity onPress={() => router.replace(Routes.login as any)} style={styles.emailLink}>
            <Ionicons name="mail-outline" size={16} color={Colors.primary} />
            <Text style={styles.emailLinkText}>Use email and password instead</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>{t('auth.phoneLogin.terms')}</Text>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backLink: {
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceGlass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoMark: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceGlass,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    marginBottom: 16,
  },
  prefix: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    color: Colors.text,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  error: {
    fontSize: 14,
    color: Colors.error,
    marginBottom: 12,
    fontWeight: '500',
  },
  emailLink: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  emailLinkText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '700',
  },
  terms: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});