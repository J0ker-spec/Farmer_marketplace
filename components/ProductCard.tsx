
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';

interface ProductCardProps {
  product: any;
  onPress: () => void;
  onAddToCart?: () => void;
}

export default function ProductCard({ product, onPress, onAddToCart }: ProductCardProps) {
  const isSoldOut = product.status === 'sold_out' || product.quantity === 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.image_url || 'https://placehold.co/400x200/1A2420/00E676/png?text=Product' }}
          style={[styles.image, isSoldOut && styles.imageDimmed]}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{product.category || 'Fresh'}</Text>
        </View>
        {isSoldOut && (
          <View style={styles.soldRibbon}>
            <Text style={styles.soldRibbonText}>SOLD OUT</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>SLL {product.price.toFixed(2)}</Text>
          <Text style={styles.unit}>/ {product.unit}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {product.description || 'Premium farm-fresh produce delivered locally.'}
        </Text>
        {product.users && (
          <View style={styles.farmerRow}>
            <Ionicons name="leaf" size={14} color={Colors.primary} />
            <Text style={styles.farmer}>
              {product.users.name} · {product.users.location || 'Sierra Leone'}
            </Text>
          </View>
        )}
        {onAddToCart && !isSoldOut && (
          <TouchableOpacity style={styles.addButton} onPress={onAddToCart} activeOpacity={0.8}>
            <Ionicons name="cart" size={18} color={Colors.background} />
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 190,
    backgroundColor: Colors.surfaceLight,
  },
  imageDimmed: {
    opacity: 0.55,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 13, 0.25)',
  },
  categoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 230, 118, 0.2)',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  soldRibbon: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: Colors.sold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  soldRibbonText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '800',
  },
  unit: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 19,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  farmer: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: Colors.background,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
