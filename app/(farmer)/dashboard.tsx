import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { borderRadius, colors, shadows, spacing } from '../../constants/designSystem';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { useTranslation } from '../../hooks/useTranslation';
import { formatLeones } from '../../utils/currency';
import { Routes } from '../../utils/routes';

export default function FarmerDashboardScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { t } = useTranslation();
  const { products } = useProducts(profile?.user_id);
  const { orders } = useOrders(profile?.user_id, 'farmer');

  const activeProducts = products.filter((p) => p.status === 'active').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  
  // Calculate earnings this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  
  const earningsThisMonth = orders
    .filter((o) => o.payment_status === 'paid' && new Date(o.order_date) >= thisMonth)
    .reduce((sum, o) => sum + Number(o.total_price), 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.name}>{profile?.name}</Text>
            <Text style={styles.farmName}>{profile?.farm_name}</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Pending Verification Banner */}
        {!profile?.verified && (
          <View style={styles.verificationBanner}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.warning} />
            <Text style={styles.verificationText}>{t('farmer.dashboard.pendingVerification')}</Text>
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="cube-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{activeProducts}</Text>
            <Text style={styles.statLabel}>{t('farmer.dashboard.activeListings')}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="receipt-outline" size={24} color={Colors.warning} />
            </View>
            <View style={styles.statBadgeRow}>
              <Text style={styles.statValue}>{pendingOrders}</Text>
              {pendingOrders > 0 && <Badge text="!" variant="error" size="small" />}
            </View>
            <Text style={styles.statLabel}>{t('farmer.dashboard.pendingOrders')}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="cash-outline" size={24} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{formatLeones(earningsThisMonth)}</Text>
            <Text style={styles.statLabel}>{t('farmer.dashboard.earningsThisMonth')}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push(Routes.farmerProducts as any)} activeOpacity={0.7}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="cube-outline" size={22} color={Colors.white} />
              </View>
              <Text style={styles.quickActionText}>Products</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push(Routes.farmerOrders as any)} activeOpacity={0.7}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="receipt-outline" size={22} color={Colors.white} />
              </View>
              <Text style={styles.quickActionText}>Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push(Routes.messages as any)} activeOpacity={0.7}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="chatbubbles-outline" size={22} color={Colors.white} />
              </View>
              <Text style={styles.quickActionText}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* New Orders Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('farmer.dashboard.newOrders')}
            </Text>
            <TouchableOpacity onPress={() => router.push(Routes.farmerOrders as any)}>
              <Text style={styles.viewAllLink}>{t('farmer.dashboard.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          {pendingOrders > 0 ? (
            <FlatList
              horizontal
              data={orders.filter((o) => o.status === 'pending').slice(0, 5)}
              keyExtractor={(item) => item.order_id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.orderCard}>
                  <Text style={styles.orderProduct}>{item.products?.name || 'Product'}</Text>
                  <Text style={styles.orderBuyer}>{item.buyer?.name || 'Buyer'}</Text>
                  <Text style={styles.orderTotal}>{formatLeones(Number(item.total_price))}</Text>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => router.push(Routes.farmerOrders as any)}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No pending orders</Text>
            </View>
          )}
        </View>

        {/* My Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('farmer.dashboard.myProducts')}</Text>
            <TouchableOpacity onPress={() => router.push(Routes.farmerProducts as any)}>
              <Text style={styles.viewAllLink}>{t('farmer.dashboard.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          {profile?.verified ? (
            products.slice(0, 3).map((item) => (
              <View key={item.product_id} style={styles.productCard}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>{formatLeones(Number(item.price))} / {item.unit}</Text>
                </View>
                <Badge text={item.status} variant={item.status === 'active' ? 'success' : 'warning'} size="small" />
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Products will be visible after verification</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB - positioned outside ScrollView */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(Routes.farmerAddProduct as any)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  farmName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
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
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.warning + '20',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  verificationText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  viewAllLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  orderCard: {
    width: 180,
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderProduct: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  orderBuyer: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 12,
  },
  viewButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    alignItems: 'center',
    padding: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
});