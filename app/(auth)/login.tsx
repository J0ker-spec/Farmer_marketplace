import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppPopup } from '../../components/ui/AppPopup';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { MOCK_USERS } from '../../services/mockData';
import { auth, db } from '../../services/firebase';
import { getAuthErrorMessage } from '../../utils/authErrors';
import { getRoleHomeRoute, Routes } from '../../utils/routes';

export default function LoginScreen() {
  const router = useRouter();
  const { loading, profile, setMockProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popup, setPopup] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    if (!loading && profile) {
      router.replace(getRoleHomeRoute(profile.role, profile.verified) as any);
    }
  }, [loading, profile, router]);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setPopup({ title: 'Missing details', message: 'Please enter both email and password.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);

      if (!userCredential?.user) {
        throw new Error('Login succeeded but no user was found. Please try again.');
      }

      const profileDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (profileDoc.exists()) {
        router.replace(Routes.splash as any);
      } else {
        setPopup({ title: 'Complete registration', message: 'Please complete your profile to continue.' });
        router.replace(Routes.roleSelect as any);
      }
    } catch (err: any) {
      setPopup({ title: 'Login failed', message: getAuthErrorMessage(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startDemo = async (type: 'buyer' | 'farmer' | 'admin') => {
    try {
      const mock =
        type === 'buyer'
          ? MOCK_USERS.find((u) => u.email === 'customer@demo.com') || MOCK_USERS[0]
          : type === 'farmer'
            ? MOCK_USERS.find((u) => u.email === 'farmer@demo.com') || MOCK_USERS.find((u) => u.role === 'farmer')
            : MOCK_USERS.find((u) => u.role === 'admin');

      if (!mock) throw new Error('Demo profile not found.');
      await setMockProfile(mock);
      router.replace(
        (type === 'buyer' ? Routes.buyerHome : type === 'farmer' ? Routes.farmerDashboard : Routes.adminDashboard) as any
      );
    } catch (error: any) {
      setPopup({ title: 'Demo unavailable', message: error?.message || 'Failed to set mock profile.' });
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Ionicons name="leaf" size={30} color={Colors.white} />
            </View>
            <Text style={styles.brandLabel}>AGRI-TECH PLATFORM</Text>
            <Text style={styles.title}>Farmer Marketplace</Text>
            <Text style={styles.subtitle}>Trade fresh produce with trusted local farmers.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isSubmitting} activeOpacity={0.8}>
              {isSubmitting ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Sign In</Text>}
            </TouchableOpacity>

            <Text style={styles.demoTitle}>Or try demo mode</Text>
            <View style={styles.demoRow}>
              <TouchableOpacity style={[styles.demoButton, styles.demoBuyerButton]} onPress={() => startDemo('buyer')} activeOpacity={0.75}>
                <Ionicons name="basket-outline" size={18} color={Colors.white} />
                <Text style={styles.demoButtonText}>Buyer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.demoButton, styles.demoFarmerButton]} onPress={() => startDemo('farmer')} activeOpacity={0.75}>
                <Ionicons name="leaf-outline" size={18} color={Colors.primary} />
                <Text style={styles.demoFarmerText}>Farmer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.demoButton, styles.demoAdminButton]} onPress={() => startDemo('admin')} activeOpacity={0.75}>
                <Ionicons name="shield-checkmark-outline" size={18} color={Colors.warning} />
                <Text style={styles.demoAdminText}>Admin</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.phoneLink} onPress={() => router.push(Routes.phoneLogin as any)} activeOpacity={0.7}>
              <Ionicons name="call-outline" size={18} color={Colors.primary} />
              <Text style={styles.phoneLinkText}>Sign in with phone number</Text>
            </TouchableOpacity>

            <View style={styles.footerInfo}>
              <Text style={styles.footerText}>Don&apos;t have an account?</Text>
              <TouchableOpacity onPress={() => router.push(Routes.roleSelect as any)}>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <AppPopup
          visible={!!popup}
          type="error"
          title={popup?.title || ''}
          message={popup?.message || ''}
          actionLabel="Got it"
          onClose={() => setPopup(null)}
        />
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoMark: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginBottom: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
  brandLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    maxWidth: 310,
    fontSize: 16,
    lineHeight: 23,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  demoTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 14,
  },
  demoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  demoButton: {
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  demoBuyerButton: {
    backgroundColor: Colors.primary,
  },
  demoFarmerButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoAdminButton: {
    backgroundColor: '#FFF4E5',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  demoButtonText: {
    color: Colors.white,
    fontWeight: '800',
  },
  demoFarmerText: {
    color: Colors.primary,
    fontWeight: '800',
  },
  demoAdminText: {
    color: Colors.warning,
    fontWeight: '800',
  },
  phoneLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    paddingVertical: 12,
  },
  phoneLinkText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '700',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  linkText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '900',
  },
});
