
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GradientBackground } from '../components/ui/GradientBackground';
import { Colors } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import { getRoleHomeRoute, Routes } from '../utils/routes';

export default function SplashScreen() {
  const router = useRouter();
  const { loading, profile } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (profile) {
        router.replace(getRoleHomeRoute(profile.role, profile.verified) as any);
      } else {
        router.replace(Routes.login as any);
      }
    }
  }, [loading, profile, router]);

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.logoRing}>
          <Text style={styles.logoIcon}>🌾</Text>
        </View>
        <Text style={styles.logo}>Farmer Marketplace</Text>
        <Text style={styles.tagline}>Sierra Leone · Agri-Tech Platform</Text>
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 44,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 40,
  },
  loader: {
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
});
