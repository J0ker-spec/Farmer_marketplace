
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ListedItemCard from '../../components/ListedItemCard';
import ProductCard from '../../components/ProductCard';
import SoldItemCard from '../../components/SoldItemCard';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { CATEGORIES } from '../../constants/categories';
import { Colors } from '../../constants/colors';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { default as useDebounce } from '../../hooks/useDebounce';
import { useProducts } from '../../hooks/useProducts';
import { MOCK_SOLD_ITEMS } from '../../services/mockData';
import { getFeaturedListedItems, mergeWithListedCatalog } from '../../utils/products';
import { Routes } from '../../utils/routes';

export default function BuyerHomeScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { products, loading, error } = useProducts();
  const { cart, addToCart } = useCart();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 250);

  const catalogProducts = useMemo(
    () => mergeWithListedCatalog(products),
    [products]
  );

  const featuredListed = useMemo(
    () => getFeaturedListedItems(products),
    [products]
  );

  const filteredProducts = useMemo(() => catalogProducts.filter((product) => {
    const q = debouncedSearch.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(q) ||
      (product.description?.toLowerCase() || '').includes(q);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [catalogProducts, debouncedSearch, selectedCategory]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addProductToCart = (item: any) => {
    addToCart({
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      unit: item.unit,
      quantity: 1,
      image_url: item.image_url,
      farmer_id: item.farmer_id,
      farmer_name: item.users?.name,
    });
    showToast('Added to cart');
  };

  const openProduct = (productId: string) => {
    router.push({ pathname: Routes.buyerProductDetails as any, params: { id: productId } });
  };

  const ListHeader = () => (
    <>
      {error ? (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color={Colors.accentWarm} />
          <Text style={styles.offlineText}>Showing local catalog — live sync unavailable</Text>
        </View>
      ) : null}
      <View style={styles.carouselSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="leaf" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Listed for Sale</Text>
          </View>
          <Text style={styles.sectionSub}>Available now from local farmers</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselList}>
          {featuredListed.map((item) => (
            <ListedItemCard
              key={item.product_id}
              item={item}
              onPress={() => openProduct(item.product_id)}
              onAddToCart={() => addProductToCart(item)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.carouselSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flash" size={18} color={Colors.accentWarm} />
            <Text style={styles.sectionTitle}>Recently Sold</Text>
          </View>
          <Text style={styles.sectionSub}>Live marketplace activity</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselList}>
          {MOCK_SOLD_ITEMS.map((item) => (
            <SoldItemCard key={item.product_id} item={item} />
          ))}
        </ScrollView>
      </View>

      <Text style={styles.marketTitle}>All Fresh Listings</Text>
    </>
  );

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingLabel}>WELCOME BACK</Text>
              <Text style={styles.greeting}>Hi, {profile?.name?.split(' ')[0] || 'Guest'} ✦</Text>
              <Text style={styles.subGreeting}>Farm-fresh produce · Sierra Leone</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push(Routes.buyerOrders as any)}>
                <Ionicons name="receipt-outline" size={22} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push(Routes.buyerCart as any)}>
                <Ionicons name="cart-outline" size={22} color={Colors.primary} />
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => signOut()}>
                <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search fresh produce..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['All', ...CATEGORIES]}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => {
              const isActive = (item === 'All' && !selectedCategory) || item === selectedCategory;
              return (
                <TouchableOpacity
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(item === 'All' ? null : item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View style={styles.content}>
          {loading ? (
            <View>
              <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonCard} />
              ))}
            </View>
        ) : (
          <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.product_id}
              contentContainerStyle={styles.productsList}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={ListHeader}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="leaf-outline" size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>No products found</Text>
                </View>
              }
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => openProduct(item.product_id)}
                  onAddToCart={() => addProductToCart(item)}
                />
              )}
            />
          )}
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  greetingLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.3,
  },
  subGreeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.sold,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: Colors.text,
  },
  categoriesList: {
    gap: 8,
    paddingRight: 20,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: Colors.background,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  carouselSection: {
    marginBottom: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.3,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    marginLeft: 26,
  },
  carouselList: {
    paddingRight: 8,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  offlineText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  marketTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  loader: {
    marginTop: 40,
  },
  productsList: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  skeletonCard: {
    height: 180,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: Colors.background,
    fontWeight: '800',
  },
});
