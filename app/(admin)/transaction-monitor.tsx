import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { Colors } from '../../constants/colors';
import { db } from '../../services/firebase';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { withOrderIds, withProductIds, withUserIds } from '../../utils/documents';

export default function AdminTransactionMonitorScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('order_date', 'desc'));
      const querySnapshot = await getDocs(q);
      const rawOrders = querySnapshot.docs.map((d) =>
        withOrderIds(d.id, d.data() as Record<string, unknown>)
      ) as any[];

      const resolved = await Promise.all(rawOrders.map(async (order) => {
        const updated = { ...order };
        if (order.product_id) {
          try {
            const productDoc = await getDoc(doc(db, 'products', order.product_id));
            if (productDoc.exists()) {
              updated.products = withProductIds(productDoc.id, productDoc.data() as Record<string, unknown>);
            }
          } catch (e) {}
        }
        if (order.buyer_id) {
          try {
            const buyerDoc = await getDoc(doc(db, 'users', order.buyer_id));
            if (buyerDoc.exists()) {
              updated.buyer = withUserIds(buyerDoc.id, buyerDoc.data() as Record<string, unknown>);
            }
          } catch (e) {}
        }
        if (order.farmer_id) {
          try {
            const farmerDoc = await getDoc(doc(db, 'users', order.farmer_id));
            if (farmerDoc.exists()) {
              updated.farmer = withUserIds(farmerDoc.id, farmerDoc.data() as Record<string, unknown>);
            }
          } catch (e) {}
        }
        return updated;
      }));

      setOrders(resolved);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAction = async (orderId: string, action: 'approve' | 'refund') => {
    try {
      if (action === 'approve') {
        await updateDoc(doc(db, 'orders', orderId), { payment_status: 'paid' });
      } else {
        await updateDoc(doc(db, 'orders', orderId), { payment_status: 'refunded', status: 'cancelled' });
      }
      await fetchOrders();
      Alert.alert('Success', `Payment ${action === 'approve' ? 'approved' : 'refunded'}`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Action failed');
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const isUnpaid = item.payment_status === 'unpaid';

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>#{item.order_id?.slice(0, 8)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: isUnpaid ? '#FFF3CD' : '#D4EDDA' }]}>
            <Text style={[styles.statusText, { color: isUnpaid ? '#F57C00' : '#388E3C' }]}>
              {isUnpaid ? 'Unpaid' : 'Paid'}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.productName}>{item.products?.name || 'Product'}</Text>
          <Text style={styles.detailText}>
            Buyer: {item.buyer?.name || 'Unknown'} | Farmer: {item.farmer?.name || 'Unknown'}
          </Text>
          <Text style={styles.detailText}>Qty: {item.quantity} • Total: SLL {Number(item.total_price).toFixed(2)}</Text>
          {item.payment_method && (
            <Text style={styles.paymentMethod}>{item.payment_method.replace('_', ' ')}</Text>
          )}
        </View>

        {isUnpaid && (
          <View style={styles.orderActions}>
            <TouchableOpacity style={styles.approveBtn} onPress={() => handlePaymentAction(item.order_id, 'approve')}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
              <Text style={styles.approveBtnText}>Approve Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.refundBtn} onPress={() => handlePaymentAction(item.order_id, 'refund')}>
              <Ionicons name="close-circle" size={18} color={Colors.error} />
              <Text style={styles.refundBtnText}>Refund</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transactions</Text>
          <TouchableOpacity onPress={fetchOrders} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={orders}
          keyExtractor={(item) => item.order_id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderOrderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="receipt-outline" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          }
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceGlass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listContent: {
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
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  orderDetails: {
    gap: 4,
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  paymentMethod: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  approveBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  refundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.error + '15',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  refundBtnText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '700',
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
});