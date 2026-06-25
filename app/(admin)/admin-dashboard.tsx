import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { Colors } from '../../constants/colors';
import { db } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Routes } from '../../utils/routes';

const screenWidth = Dimensions.get('window').width;

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingFarmers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    thisMonthOrders: 0,
    lastMonthOrders: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    thisMonthUsers: 0,
    lastMonthUsers: 0,
    categoryCounts: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
  };

  const fetchStats = async () => {
    try {
      setError(null);
      const [usersSnapshot, ordersSnapshot, productsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'products')),
      ]);

      const users = usersSnapshot.docs.map(doc => doc.data());
      const orders = ordersSnapshot.docs.map(doc => doc.data());
      const products = productsSnapshot.docs.map(doc => doc.data());

      const now = new Date();
      const thisMonth = getMonthRange(now);
      const lastMonth = getMonthRange(new Date(now.getFullYear(), now.getMonth() - 1, 1));

      // Category distribution
      const categoryCounts: Record<string, number> = {};
      products.forEach((p: any) => {
        const cat = p.category || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      setStats({
        totalUsers: users.length,
        pendingFarmers: users.filter((u: any) => u.role === 'farmer' && !u.verified).length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o: any) => sum + Number(o.total_price), 0),
        thisMonthOrders: orders.filter((o: any) => {
          const d = new Date(o.order_date);
          return d >= thisMonth.start && d <= thisMonth.end;
        }).length,
        lastMonthOrders: orders.filter((o: any) => {
          const d = new Date(o.order_date);
          return d >= lastMonth.start && d <= lastMonth.end;
        }).length,
        thisMonthRevenue: orders
          .filter((o: any) => {
            const d = new Date(o.order_date);
            return d >= thisMonth.start && d <= thisMonth.end;
          })
          .reduce((sum: number, o: any) => sum + Number(o.total_price), 0),
        lastMonthRevenue: orders
          .filter((o: any) => {
            const d = new Date(o.order_date);
            return d >= lastMonth.start && d <= lastMonth.end;
          })
          .reduce((sum: number, o: any) => sum + Number(o.total_price), 0),
        thisMonthUsers: users.filter((u: any) => {
          const d = new Date(u.created_at || u.registered_at || Date.now());
          return d >= thisMonth.start && d <= thisMonth.end;
        }).length,
        lastMonthUsers: users.filter((u: any) => {
          const d = new Date(u.created_at || u.registered_at || Date.now());
          return d >= lastMonth.start && d <= lastMonth.end;
        }).length,
        categoryCounts,
      });
    } catch (e: any) {
      console.error(e);
      setError((e as any)?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getChangeColor = (current: number, previous: number) => {
    if (current >= previous) return Colors.success;
    return Colors.error;
  };

  const maxCategoryCount = Math.max(...Object.values(stats.categoryCounts), 1);

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </GradientBackground>
    );
  }

  if (error) {
    return (
      <GradientBackground>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => { setLoading(true); fetchStats(); }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerGreeting}>Admin Panel</Text>
            <Text style={styles.headerSubtitle}>Platform overview</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Ionicons name="people-outline" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
            <View style={styles.comparisonRow}>
              <Ionicons name="trending-up-outline" size={14} color={getChangeColor(stats.thisMonthUsers, stats.lastMonthUsers)} />
              <Text style={[styles.changeText, { color: getChangeColor(stats.thisMonthUsers, stats.lastMonthUsers) }]}>
                {getPercentChange(stats.thisMonthUsers, stats.lastMonthUsers)} vs last month
              </Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.warning + '20' }]}>
              <Ionicons name="hourglass-outline" size={28} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats.pendingFarmers}</Text>
            <Text style={styles.statLabel}>Pending Farmers</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.success + '20' }]}>
              <Ionicons name="cart-outline" size={28} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
            <View style={styles.comparisonRow}>
              <Ionicons name="trending-up-outline" size={14} color={getChangeColor(stats.thisMonthOrders, stats.lastMonthOrders)} />
              <Text style={[styles.changeText, { color: getChangeColor(stats.thisMonthOrders, stats.lastMonthOrders) }]}>
                {getPercentChange(stats.thisMonthOrders, stats.lastMonthOrders)} vs last month
              </Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#9C27B020' }]}>
              <Ionicons name="cash-outline" size={28} color="#9C27B0" />
            </View>
            <Text style={styles.statValue}>SLL {stats.totalRevenue.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
            <View style={styles.comparisonRow}>
              <Ionicons name="trending-up-outline" size={14} color={getChangeColor(stats.thisMonthRevenue, stats.lastMonthRevenue)} />
              <Text style={[styles.changeText, { color: getChangeColor(stats.thisMonthRevenue, stats.lastMonthRevenue) }]}>
                {getPercentChange(stats.thisMonthRevenue, stats.lastMonthRevenue)} vs last month
              </Text>
            </View>
          </View>
        </View>

        {/* Monthly Comparison Graph */}
        <View style={styles.graphSection}>
          <Text style={styles.sectionTitle}>Monthly Comparison</Text>
          <View style={styles.comparisonCard}>
            <View style={styles.comparisonRowCard}>
              <View style={styles.comparisonLabelGroup}>
                <Text style={styles.comparisonLabel}>Orders</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={styles.barRow}>
                  <Text style={styles.barLabel}>This month</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { 
                      width: `${Math.min((stats.thisMonthOrders / Math.max(stats.thisMonthOrders, stats.lastMonthOrders, 1)) * 100, 100)}%`,
                      backgroundColor: Colors.primary 
                    }]} />
                  </View>
                  <Text style={styles.barValue}>{stats.thisMonthOrders}</Text>
                </View>
                <View style={styles.barRow}>
                  <Text style={styles.barLabel}>Last month</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { 
                      width: `${Math.min((stats.lastMonthOrders / Math.max(stats.thisMonthOrders, stats.lastMonthOrders, 1)) * 100, 100)}%`,
                      backgroundColor: Colors.textSecondary 
                    }]} />
                  </View>
                  <Text style={styles.barValue}>{stats.lastMonthOrders}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.comparisonRowCard}>
              <View style={styles.comparisonLabelGroup}>
                <Text style={styles.comparisonLabel}>Revenue</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={styles.barRow}>
                  <Text style={styles.barLabel}>This month</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { 
                      width: `${Math.min((stats.thisMonthRevenue / Math.max(stats.thisMonthRevenue, stats.lastMonthRevenue, 1)) * 100, 100)}%`,
                      backgroundColor: Colors.success 
                    }]} />
                  </View>
                  <Text style={styles.barValue}>SLL {stats.thisMonthRevenue.toFixed(0)}</Text>
                </View>
                <View style={styles.barRow}>
                  <Text style={styles.barLabel}>Last month</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { 
                      width: `${Math.min((stats.lastMonthRevenue / Math.max(stats.thisMonthRevenue, stats.lastMonthRevenue, 1)) * 100, 100)}%`,
                      backgroundColor: Colors.textSecondary 
                    }]} />
                  </View>
                  <Text style={styles.barValue}>SLL {stats.lastMonthRevenue.toFixed(0)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Category Distribution */}
        {Object.keys(stats.categoryCounts).length > 0 && (
          <View style={styles.graphSection}>
            <Text style={styles.sectionTitle}>Products by Category</Text>
            <View style={styles.categoryCard}>
              {Object.entries(stats.categoryCounts).map(([cat, count]) => (
                <View key={cat} style={styles.categoryRow}>
                  <Text style={styles.categoryName}>{cat}</Text>
                  <View style={styles.categoryBarTrack}>
                    <View style={[styles.categoryBarFill, { 
                      width: `${(count / maxCategoryCount) * 100}%`,
                      backgroundColor: Colors.primary 
                    }]} />
                  </View>
                  <Text style={styles.categoryCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push(Routes.adminUsers as any)}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrap}>
              <Ionicons name="people-circle-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.actionTitle}>Manage Users</Text>
              <Text style={styles.actionSubtitle}>Approve farmers and manage accounts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push(Routes.adminTransactions as any)}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrap}>
              <Ionicons name="receipt-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.actionTitle}>Monitor Transactions</Text>
              <Text style={styles.actionSubtitle}>View and manage orders</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push({ pathname: Routes.adminUsers as any, params: { filter: 'farmer' } })}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: Colors.error + '20' }]}>
              <Ionicons name="alert-circle-outline" size={24} color={Colors.error} />
            </View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.actionTitle}>Pending Farmers</Text>
              <Text style={styles.actionSubtitle}>Review and approve farmer applications</Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerGreeting: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  graphSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  comparisonCard: {
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comparisonRowCard: {
    gap: 8,
  },
  comparisonLabelGroup: {
    marginBottom: 4,
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  barContainer: {
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    width: 70,
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
    height: 18,
    backgroundColor: Colors.background,
    borderRadius: 9,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 9,
    minWidth: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    width: 70,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  categoryCard: {
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryName: {
    fontSize: 12,
    color: Colors.text,
    width: 80,
    fontWeight: '600',
  },
  categoryBarTrack: {
    flex: 1,
    height: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 8,
    minWidth: 4,
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    width: 30,
    textAlign: 'right',
  },
  section: {
    padding: 16,
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionTextGroup: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});