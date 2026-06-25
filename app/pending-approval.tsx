import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientBackground } from '../components/ui/GradientBackground';
import { Colors } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebase';
import { Routes, getRoleHomeRoute } from '../utils/routes';

export default function PendingApprovalScreen() {
  const router = useRouter();
  const { profile, refetchProfile, signOut } = useAuth();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!profile?.user_id) return;

    const unsubscribe = onSnapshot(doc(db, 'users', profile.user_id), (snap) => {
      if (snap.exists() && snap.data()?.verified) {
        const homeRoute = getRoleHomeRoute(profile.role, true);
        router.replace(homeRoute as any);
      }
    });

    return () => unsubscribe();
  }, [profile?.user_id, profile?.role, router]);

  const handleCheckStatus = async () => {
    if (!profile?.user_id) {
      Alert.alert('Error', 'Session details not found. Please sign in again.');
      return;
    }
    
    setChecking(true);
    try {
      const profileDoc = await getDoc(doc(db, 'users', profile.user_id));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        if (data.verified) {
          Alert.alert('Verified!', 'Your account has been approved. Welcome!');
          await refetchProfile(profile.user_id);
          const homeRoute = getRoleHomeRoute(profile.role, true);
          router.replace(homeRoute as any);
        } else {
          Alert.alert('Status Check', 'Your account is still pending approval. Please check again later.');
        }
      } else {
        Alert.alert('Error', 'User profile not found.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to check status');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace(Routes.login as any);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to log out');
    }
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={48} color={Colors.primary} />
          </View>
          
          <Text style={styles.title}>Approval Pending</Text>
          <Text style={styles.subtitle}>
            Thank you for registering on Farmer Marketplace. 
            Your account is currently under review by our admin team.
          </Text>
          
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Verification typically takes 24-48 hours. We review all new accounts for security.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleCheckStatus} 
            disabled={checking}
            activeOpacity={0.8}
          >
            {checking ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="refresh" size={18} color={Colors.white} />
                <Text style={styles.buttonText}>Check Status</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={Colors.error} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryGlow,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '40',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    gap: 10,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceGlass,
  },
  logoutButtonText: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
});