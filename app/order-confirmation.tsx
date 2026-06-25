import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientBackground } from '../components/ui/GradientBackground';
import { Colors } from '../constants/colors';
import { Routes } from '../utils/routes';

export default function OrderConfirmationScreen() {
  const router = useRouter();

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconRing}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Order Confirmed ✦</Text>
          <Text style={styles.subtitle}>
            Your order is live. The farmer has been notified and will confirm shortly.
          </Text>

          <View style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>What happens next</Text>
            <View style={styles.stepRow}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <Text style={styles.stepText}>Farmer confirms your order.</Text>
            </View>
            <View style={styles.stepRow}>
              <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
              <Text style={styles.stepText}>Track updates in My Orders.</Text>
            </View>
            <View style={styles.stepRow}>
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
              <Text style={styles.stepText}>Message the farmer anytime.</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace(Routes.buyerOrders as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="receipt-outline" size={20} color={Colors.background} />
            <Text style={styles.primaryButtonText}>View My Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace(Routes.buyerHome as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="storefront-outline" size={20} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
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
    padding: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  iconRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  stepsCard: {
    width: '100%',
    backgroundColor: Colors.backgroundElevated,
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    gap: 10,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
