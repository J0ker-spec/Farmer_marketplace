import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { Colors } from '../../constants/colors';
import { useToast } from '../../context/ToastContext';
import { db } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';

export default function FarmerOrdersScreen() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const { orders, loading, error, refetch } = useOrders(profile?.user_id, 'farmer');
  const { showToast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setActionLoading(true);
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      showToast(`Order marked ${newStatus}`);
      await refetch();
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'Failed to update order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = (order: any) => {
    const actions: { label: string; status: string; color?: string }[] = [];

    if (order.status === 'pending') {
      actions.push({ label: 'Confirm Order', status: 'confirmed' });
      actions.push({ label: 'Cancel', status: 'cancelled', color: Colors.error });
    } else if (order.status === 'confirmed') {
      actions.push({ label: 'Mark as Shipped', status: 'shipped' });
    } else if (order.status === 'shipped') {
      actions.push({ label: 'Mark as Delivered', status: 'delivered' });
    }

    if (actions.length > 0) {
      Alert.alert('Order Actions', 'Select an action', [
        ...actions.map((a) => ({
          text: a.label,
          onPress: () => updateOrderStatus(order.order_id, a.status),
          style: (a.color === Colors.error ? 'destructive' : 'default') as 'default' | 'destructive' | 'cancel',
        })),
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Orders</Text>
          <View style={{ width: 40 }} />
        </View>

        {authLoading || loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconCircle}>
              <Ionicons name="cloud-offline-outline" size={40} color={Colors.error} />
            </View>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                refetch();
                showToast('Reloading orders...');
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.order_id}
            contentContainerStyle={styles.ordersList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="receipt-outline" size={48} color={Colors.primary} />
                </View>
                <Text style={styles.emptyText}>No orders yet</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Order #{item.order_id.slice(0, 8)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <Text style={styles.productName}>{item.products?.name || 'Unknown Product'}</Text>
                  <Text style={styles.buyerName}>Buyer: {item.buyer?.name || 'Unknown'}</Text>
                  <Text style={styles.detailsText}>
                    Quantity: {item.quantity} • Total: SLL {item.total_price.toFixed(2)}
                  </Text>
                  <Text style={styles.paymentText}>
                    Payment: {(item.payment_method || 'cash').replace('_', ' ')} • {(item.payment_status || 'pending').charAt(0).toUpperCase() + (item.payment_status || 'pending').slice(1)}
                  </Text>
                  {item.delivery_address && (
                    <Text style={styles.addressText}>Deliver to: {item.delivery_address}</Text>
                  )}
                </View>

                <View style={styles.orderActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      if (item.buyer?.phone) {
                        Linking.openURL(`tel:${item.buyer.phone}`);
                      } else {
                        Alert.alert('Info', 'Buyer phone number not available');
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call-outline" size={18} color={Colors.primary} />
                    <Text style={styles.actionButtonText}>Call Buyer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryButton, actionLoading && styles.disabledButton]}
                    onPress={() => handleAction(item)}
                    disabled={actionLoading}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="ellipsis-horizontal-outline" size={18} color={Colors.white} />
                    <Text style={styles.primaryButtonText}>Manage</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </GradientBackground>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return '#FFF3CD';
    case 'confirmed':
      return '#D1ECF1';
    case 'shipped':
      return '#CCE5FF';
    case 'delivered':
      return '#D4EDDA';
    case 'cancelled':
      return '#F8D7DA';
    default:
      return '#E0E0E0';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ordersList: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  orderDetails: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  buyerName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  paymentText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  actionButtonText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 6,
  },
  primaryButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.6,
  },
});