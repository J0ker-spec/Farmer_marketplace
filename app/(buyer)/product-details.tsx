import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import ProductReviews from '../../components/ProductReviews';
import { Colors } from '../../constants/colors';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { findMockProduct } from '../../services/mockData';
import { Routes } from '../../utils/routes';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { profile } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const productDoc = await getDoc(doc(db, 'products', id as string));
      if (productDoc.exists()) {
        const productData = productDoc.data();
        const mappedProduct = {
          ...productData,
          id: productDoc.id,
          product_id: productDoc.id,
        } as any;

        const farmerId = productData.farmer_id;
        if (farmerId) {
          const farmerDoc = await getDoc(doc(db, 'users', farmerId));
          if (farmerDoc.exists()) {
            mappedProduct.users = farmerDoc.data();
          }
        }
        setProduct(mappedProduct);
        return;
      }

      const mock = findMockProduct(id as string);
      if (mock) {
        setProduct({ ...mock, id: mock.product_id, product_id: mock.product_id });
      }
    } catch (e) {
      console.error(e);
      const mock = findMockProduct(id as string);
      if (mock) {
        setProduct({ ...mock, id: mock.product_id, product_id: mock.product_id });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    if (quantity > product.quantity) {
      Alert.alert('Error', 'Not enough stock available');
      return;
    }
    addToCart({
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      quantity,
      image_url: product.image_url,
      farmer_id: product.farmer_id,
      farmer_name: product.users?.name,
    });
    showToast('Added to cart');
  };

  const handleCallFarmer = () => {
    if (product?.users?.phone) {
      Linking.openURL(`tel:${product.users.phone}`);
    }
  };

  const getFreshnessColor = (harvestDate: string) => {
    const daysSinceHarvest = Math.floor((Date.now() - new Date(harvestDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceHarvest <= 2) return Colors.success;
    if (daysSinceHarvest <= 5) return '#F59E0B';
    return Colors.error;
  };

  const getFreshnessLabel = (harvestDate: string) => {
    const daysSinceHarvest = Math.floor((Date.now() - new Date(harvestDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceHarvest <= 2) return 'Very Fresh';
    if (daysSinceHarvest <= 5) return 'Fresh';
    if (daysSinceHarvest <= 7) return 'Moderate';
    return 'Use Soon';
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

  if (!product) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.notFoundText}>Product not found</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: product.image_url || 'https://placehold.co/600x400/2E7D32/FFFFFF/png?text=Product' }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{product.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
          </View>

          <Text style={styles.price}>SLL {product.price.toFixed(2)} / {product.unit}</Text>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description || 'No description available'}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Stock Available</Text>
            <View style={styles.stockRow}>
              <Ionicons name="cube-outline" size={20} color={Colors.primary} />
              <Text style={styles.stock}>{product.quantity} {product.unit}</Text>
            </View>
          </View>

          {product.harvest_date && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Freshness</Text>
              <View style={styles.freshnessIndicator}>
                <Ionicons 
                  name="leaf-outline" 
                  size={20} 
                  color={getFreshnessColor(product.harvest_date)} 
                />
                <Text style={[styles.freshnessText, { color: getFreshnessColor(product.harvest_date) }]}>
                  {getFreshnessLabel(product.harvest_date)}
                </Text>
              </View>
              <Text style={styles.harvestDateText}>
                Harvested: {new Date(product.harvest_date).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.sectionCard}>
            <View style={styles.farmerInfo}>
              <View style={styles.farmerAvatar}>
                <Ionicons name="person" size={24} color={Colors.primary} />
              </View>
              <View style={styles.farmerDetails}>
                <Text style={styles.farmerName}>{product.users?.name}</Text>
                <Text style={styles.farmerLocation}>{product.users?.location || 'Sierra Leone'}</Text>
              </View>
            </View>
            <View style={styles.farmerActions}>
              <TouchableOpacity 
                style={styles.callButton} 
                onPress={handleCallFarmer}
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={16} color={Colors.white} />
                <Text style={styles.buttonLabel}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.callButton, { backgroundColor: Colors.primary }]}
                onPress={() => {
                  if (profile?.user_id) {
                    router.push({ 
                      pathname: Routes.messages as any, 
                      params: { 
                        recipientId: product.farmer_id, 
                        recipientName: product.users?.name,
                        productId: product.product_id,
                        productName: product.name
                      } 
                    });
                  } else {
                    Alert.alert('Error', 'Please sign in to message farmers');
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble-outline" size={16} color={Colors.white} />
                <Text style={styles.buttonLabel}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={18} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.min(product.quantity, quantity + 1))}
              >
                <Ionicons name="add" size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart} activeOpacity={0.8}>
            <Ionicons name="cart" size={20} color={Colors.white} />
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>

          <View style={styles.reviewsSection}>
            <ProductReviews productId={product.product_id} />
          </View>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
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
  image: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.primaryLight,
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '40',
  },
  categoryText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  price: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: '900',
    marginBottom: 20,
  },
  sectionCard: {
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 23,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stock: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  freshnessIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  freshnessText: {
    fontSize: 15,
    fontWeight: '700',
  },
  harvestDateText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  farmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  farmerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  farmerLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  farmerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.success,
  },
  buttonLabel: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    minWidth: 30,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  reviewsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 20,
    marginBottom: 30,
  },
});