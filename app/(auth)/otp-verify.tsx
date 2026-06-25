import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ConfirmationResult, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../hooks/useTranslation';
import { auth, db } from '../../services/firebase';
import { Routes } from '../../utils/routes';

const DEMO_OTP = '123456';

export default function OTPVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; role?: string }>();
  const { t } = useTranslation();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }

    return () => clearTimeout(timer);
  }, [countdown]);

  const navigateAfterAuth = async (uid: string, isNewUser: boolean) => {
    const role = params.role || 'buyer';

    if (!isNewUser) {
      router.replace(Routes.splash as any);
      return;
    }

    if (role === 'admin') {
      await setDoc(doc(db, 'users', uid), {
        user_id: uid,
        phone: params.phone,
        role: 'admin',
        verified: true,
        created_at: new Date().toISOString(),
      });
      router.replace(Routes.splash as any);
    } else if (role === 'farmer') {
      router.replace({
        pathname: Routes.registerFarmer as any,
        params: { phone: params.phone || '' },
      });
    } else {
      router.replace({
        pathname: Routes.registerBuyer as any,
        params: { phone: params.phone || '' },
      });
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d)) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleVerify = async (code: string) => {
    if (!params.phone) {
      setError('Phone number missing. Please go back and try again.');
      return;
    }

    if (code.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const confirmation: ConfirmationResult | undefined = (global as any).confirmationResult;

      if (confirmation) {
        const credential = PhoneAuthProvider.credential(confirmation.verificationId, code);
        const result = await signInWithCredential(auth, credential);
        const userRef = doc(db, 'users', result.user.uid);
        const userSnap = await getDoc(userRef);
        await navigateAfterAuth(result.user.uid, !userSnap.exists());
        return;
      }

      // Demo / dev fallback when Firebase phone auth session is not configured
      if (code === DEMO_OTP) {
        const role = params.role || 'buyer';
        if (role === 'farmer') {
          router.replace({ pathname: Routes.registerFarmer as any, params: { phone: params.phone || '' } });
        } else {
          router.replace({ pathname: Routes.registerBuyer as any, params: { phone: params.phone || '' } });
        }
        return;
      }

      setError(`Invalid code. For demo, use ${DEMO_OTP} or sign in with email.`);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setCountdown(45);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    router.back();
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Ionicons name="lock-closed" size={28} color={Colors.white} />
          </View>
          <Text style={styles.title}>
            {t('auth.otpVerify.title')}
          </Text>
          <Text style={styles.phoneText}>{params.phone}</Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(v) => handleOTPChange(index, v)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {canResend ? (
          <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
            <Text style={styles.resendLink}>{t('auth.otpVerify.resend')}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.countdown}>
            {t('auth.otpVerify.resendIn')} {Math.floor(countdown / 60)}:
            {(countdown % 60).toString().padStart(2, '0')}
          </Text>
        )}

        <Button
          title="Verify"
          onPress={() => handleVerify(otp.join(''))}
          loading={loading}
          disabled={otp.some((d) => !d)}
          style={styles.button}
        />

        <Text style={styles.hint}>Demo code: {DEMO_OTP}</Text>

        <TouchableOpacity onPress={() => router.replace(Routes.login as any)} style={styles.emailLink}>
          <Ionicons name="mail-outline" size={16} color={Colors.primary} />
          <Text style={styles.emailLinkText}>Use email login instead</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
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
    marginBottom: 40,
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
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  otpInput: {
    flex: 1,
    height: 60,
    backgroundColor: Colors.surfaceGlass,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 14,
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
  },
  error: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  resendBtn: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendLink: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '800',
  },
  countdown: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
  hint: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
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
});