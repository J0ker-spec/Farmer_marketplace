import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';

interface SoldItem {
  product_id: string;
  name: string;
  price: number;
  unit: string;
  image_url?: string;
  sold_at?: string;
  buyer_name?: string;
  farmer_name?: string;
}

interface SoldItemCardProps {
  item: SoldItem;
}

export default function SoldItemCard({ item }: SoldItemCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: item.image_url || 'https://placehold.co/120x120/1A2420/00E676/png?text=Sold' }}
          style={styles.image}
        />
        <View style={styles.soldBadge}>
          <Ionicons name="checkmark-circle" size={12} color={Colors.white} />
          <Text style={styles.soldText}>SOLD</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>SLL {item.price.toFixed(0)} / {item.unit}</Text>
        {item.buyer_name ? (
          <Text style={styles.meta} numberOfLines={1}>to {item.buyer_name}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    marginRight: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    overflow: 'hidden',
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 90,
    backgroundColor: Colors.surfaceLight,
    opacity: 0.85,
  },
  soldBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.sold,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  soldText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  meta: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
