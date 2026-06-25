
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';

interface OrderItemProps {
  order: any;
  onPress?: () => void;
}

export default function OrderItem({ order, onPress }: OrderItemProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'hourglass-outline';
      case 'processing':
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'packed':
        return 'cube-outline';
      case 'shipped':
      case 'out_for_delivery':
        return 'car-outline';
      case 'delivered':
        return 'checkmark-done-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getPaymentIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return 'checkmark-circle';
      case 'pending':
        return 'hourglass';
      case 'unpaid':
        return 'alert-circle-outline';
      case 'refunded':
        return 'undo-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View>
          <Text style={styles.orderId}>Order {(order.order_id || order.id || '--------').slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{order.order_date ? new Date(order.order_date).toLocaleDateString() : '—'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.fulfillment_status || order.status) }]}>
          <Ionicons 
            name={getStatusIcon(order.fulfillment_status || order.status) as any} 
            size={16} 
            color={getStatusTextColor(order.fulfillment_status || order.status)}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.statusText, { color: getStatusTextColor(order.fulfillment_status || order.status) }]}>
            {formatStatus(order.fulfillment_status || order.status)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.productName}>{order.products?.name || 'Unknown Product'}</Text>
        <View style={styles.details}>
          <Text style={styles.detailText}>Qty: {order.quantity ?? 0} × SLL {(order.price ?? order.products?.price ?? 0).toFixed(2)}</Text>
          <Text style={styles.detailText}>Total: SLL {(order.total_price ?? 0).toFixed(2)}</Text>
        </View>

        {order.delivery_address && (
          <View style={styles.deliveryInfo}>
            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.deliveryText}>{order.delivery_address}</Text>
          </View>
        )}

        {order.tracking_number && (
          <View style={styles.trackingInfo}>
            <Ionicons name="barcode-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.trackingText}>Tracking: {order.tracking_number}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.paymentStatus}>
          <Ionicons 
            name={getPaymentIcon(order.payment_status) as any} 
            size={16} 
            color={getPaymentStatusColor(order.payment_status)}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.paymentText, { color: getPaymentStatusColor(order.payment_status) }]}>
            {formatPaymentStatus(order.payment_status)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

function formatStatus(status: string) {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatPaymentStatus(status: string) {
  const labels: { [key: string]: string } = {
    'paid': 'Paid',
    'unpaid': 'Unpaid',
    'pending': 'Pending',
    'refunded': 'Refunded',
  };
  return labels[status] || status;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return '#FFF3CD';
    case 'processing':
    case 'confirmed':
      return '#CCE5FF';
    case 'packed':
      return '#E2BEF5';
    case 'shipped':
    case 'out_for_delivery':
      return '#FFE5CC';
    case 'delivered':
      return '#D4EDDA';
    case 'cancelled':
      return '#F8D7DA';
    default:
      return '#E9ECEF';
  }
}

function getStatusTextColor(status: string) {
  switch (status) {
    case 'pending':
      return '#856404';
    case 'processing':
    case 'confirmed':
      return '#004085';
    case 'packed':
      return '#6F42C1';
    case 'shipped':
    case 'out_for_delivery':
      return '#CC7A00';
    case 'delivered':
      return '#155724';
    case 'cancelled':
      return '#721C24';
    default:
      return '#383D41';
  }
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'paid':
      return '#28A745';
    case 'pending':
      return '#FFC107';
    case 'unpaid':
      return '#DC3545';
    case 'refunded':
      return '#6C757D';
    default:
      return '#6C757D';
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  details: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  deliveryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  trackingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

