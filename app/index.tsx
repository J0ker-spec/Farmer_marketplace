import { useRouter } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GradientBackground } from '../components/ui/GradientBackground';
import { Colors } from '../constants/colors';
import { Routes } from '../utils/routes';

export default function Index() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => {
        router.replace(Routes.login as any);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isMounted, router]);

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>FM</Text>
        </View>
        <Text style={styles.title}>Farmer Marketplace</Text>
        <Text style={styles.subtitle}>Fresh produce, trusted local sellers</Text>
        <ActivityIndicator color={Colors.primary} size="large" style={styles.loader} />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoMark: {
    width: 84,
    height: 84,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 6,
  },
  logoText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '900',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loader: {
    marginTop: 28,
  },
});
