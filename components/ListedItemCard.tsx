import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';

interface ListedItem {
  product_id: string;
  id?: string;
  name: string;
  price: number;
  unit: string;
  image_url?: string;
  farmer_id?: string;
  users?: { name?: string };
}

interface ListedItemCardProps {
  item: ListedItem;
  onPress: () => void;
  onAddToCart?: () => void;
}

export default function ListedItemCard({ item, onPress, onAddToCart }: ListedItemCardProps) {
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: item.image_url || 'https://placehold.co/140x100/1A2420/00E676/png?text=Fresh' }}
            style={styles.image}
          />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>FOR SALE</Text>
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.price}>SLL {item.price.toFixed(0)} / {item.unit}</Text>
          {item.users?.name ? (
            <Text style={styles.farmer} numberOfLines={1}>{item.users.name}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
      {onAddToCart && (
        <TouchableOpacity style={styles.cartBtn} onPress={onAddToCart} activeOpacity={0.8}>
          <Ionicons name="cart" size={14} color={Colors.background} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    marginRight: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 100,
    backgroundColor: Colors.surfaceLight,
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: Colors.background,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  info: {
    padding: 10,
    paddingRight: 36,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  farmer: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  cartBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
});
