import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { Colors } from '../../constants/colors';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { useProducts } from '../../hooks/useProducts';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Routes } from '../../utils/routes';

export default function FarmerMyProductsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { products, loading, refetch } = useProducts(profile?.user_id);
  const { showToast } = useToast();

  const deleteProduct = async (productId: string) => {
    Alert.alert('Confirm', 'Are you sure you want to remove this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await updateDoc(doc(db, 'products', productId), {
              status: 'removed',
            });

            showToast('Product removed');
            if (refetch) await refetch();
          } catch (e: any) {
            console.error(e);
            Alert.alert('Error', e?.message || 'Failed to remove product');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
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
          <Text style={styles.headerTitle}>My Products</Text>
          <TouchableOpacity
            onPress={() => router.push(Routes.farmerAddProduct as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={30} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.product_id}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="cube-outline" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.emptyText}>No products yet</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push(Routes.farmerAddProduct as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.addButtonText}>Add First Product</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image
                source={{ uri: item.image_url || 'https://placehold.co/120x120/2E7D32/FFFFFF/png?text=Product' }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>SLL {item.price.toFixed(2)} / {item.unit}</Text>
                <View style={styles.productMetaRow}>
                  <View style={[styles.statusBadge, (styles as any)[`status_${item.status}`]]}>
                    <Text style={[styles.statusBadgeText, (styles as any)[`statusText_${item.status}`]]}>
                      {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.stock}>Stock: {item.quantity}</Text>
                </View>
              </View>
              <View style={styles.productActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    router.push({
                      pathname: Routes.farmerAddProduct as any,
                      params: { id: item.product_id },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteProduct(item.product_id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push(Routes.farmerAddProduct as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  productsList: {
    padding: 20,
    paddingBottom: 80,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
  },
  productInfo: {
    flex: 1,
    marginLeft: 14,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 6,
  },
  productMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  status_active: {
    backgroundColor: '#D4EDDA',
  },
  statusText_active: {
    color: '#388E3C',
  },
  status_sold_out: {
    backgroundColor: '#FFF3CD',
  },
  statusText_sold_out: {
    color: '#F57C00',
  },
  status_removed: {
    backgroundColor: '#F8D7DA',
  },
  statusText_removed: {
    color: '#D32F2F',
  },
  stock: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  productActions: {
    gap: 6,
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deleteButton: {
    borderColor: '#FECACA',
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
    marginBottom: 24,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
});