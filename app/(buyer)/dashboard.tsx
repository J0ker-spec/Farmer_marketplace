import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { Colors } from '../../constants/colors';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';
import { Routes } from '../../utils/routes';

interface StatCard {
  id: string;
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

export default function BuyerDashboardScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { cart } = useCart();
  const { orders, loading: ordersLoading } = useOrders(profile?.user_id, 'buyer');

  const stats: StatCard[] = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    const pendingOrders = orders.filter((o) => o.payment_status === 'unpaid').length;
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;

    return [
      {
        id: 'orders',
        label: 'Total Orders',
        value: orders.length,
        icon: 'receipt-outline',
        color: Colors.primary,
      },
      {
        id: 'pending',
        label: 'Pending Payment',
        value: pendingOrders,
        icon: 'hourglass-outline',
        color: '#FF9800',
      },
      {
        id: 'delivered',
        label: 'Delivered',
        value: deliveredOrders,
        icon: 'checkmark-circle-outline',
        color: '#4CAF50',
      },
      {
        id: 'spent',
        label: 'Total Spent',
        value: `SLL ${totalSpent.toFixed(2)}`,
        icon: 'cash-outline',
        color: '#9C27B0',
      },
    ];
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);

  const quickActions = [
    {
      id: 'shop',
      label: 'Shop',
      icon: 'storefront-outline',
      onPress: () => router.push(Routes.buyerHome as any),
    },
    {
      id: 'cart',
      label: `Cart (${cart.reduce((sum, item) => sum + item.quantity, 0)})`,
      icon: 'cart-outline',
      onPress: () => router.push(Routes.buyerCart as any),
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'chatbubbles-outline',
      onPress: () => router.push(Routes.messages as any),
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: 'list-outline',
      onPress: () => router.push(Routes.buyerOrders as any),
    },
  ];

  return (
    <GradientBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <TouchableOpacity onPress={() => signOut()} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeLeft}>
              <Text style={styles.welcomeGreeting}>Welcome back! 👋</Text>
              <Text style={styles.welcomeName}>{profile?.name}</Text>
              <Text style={styles.welcomeEmail}>{profile?.email}</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={32} color={Colors.primary} />
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.id} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name={action.icon as any} size={24} color={Colors.white} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push(Routes.buyerOrders as any)}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {ordersLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
          ) : recentOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="receipt-outline" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.emptyText}>No orders yet</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push(Routes.buyerHome as any)}
              >
                <Text style={styles.emptyButtonText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={recentOrders}
              keyExtractor={(item) => item.order_id}
              contentContainerStyle={styles.ordersList}
              renderItem={({ item }) => {
                const OrderItemComponent = require('../../components/OrderItem').default;
                return <OrderItemComponent order={item} />;
              }}
            />
          )}
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => Alert.alert('Documents', 'Your receipts and invoices will appear here')}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name="document-outline" size={22} color={Colors.primary} />
              </View>
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemTitle}>Documents</Text>
                <Text style={styles.settingItemDesc}>View receipts and invoices</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => Alert.alert('Addresses', 'Manage your delivery addresses')}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name="location-outline" size={22} color={Colors.primary} />
              </View>
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemTitle}>Addresses</Text>
                <Text style={styles.settingItemDesc}>Manage delivery addresses</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => Alert.alert('Preferences', 'Customize your notification and privacy settings')}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name="settings-outline" size={22} color={Colors.primary} />
              </View>
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemTitle}>Preferences</Text>
                <Text style={styles.settingItemDesc}>Notification & privacy settings</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.settingItemDanger]}
            onPress={() => signOut()}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.error + '20' }]}>
                <Ionicons name="log-out-outline" size={22} color={Colors.error} />
              </View>
              <View style={styles.settingItemText}>
                <Text style={[styles.settingItemTitle, { color: Colors.error }]}>Sign Out</Text>
                <Text style={styles.settingItemDesc}>Log out from your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  logoutBtn: {
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
  welcomeCard: {
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  welcomeLeft: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  welcomeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  welcomeEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '23%',
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
  ordersList: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  settingItem: {
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingItemDanger: {
    borderColor: '#FECACA',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingItemText: {
    marginLeft: 14,
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  settingItemDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});