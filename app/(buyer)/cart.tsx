import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { Colors } from '../../constants/colors';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Routes } from '../../utils/routes';

interface CartGroup {
  farmerId: string;
  farmerName: string;
  items: any[];
  deliveryType: 'delivery' | 'pickup';
}

export default function CartScreen() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { showToast } = useToast();
  const [deliveryTypes, setDeliveryTypes] = useState<Record<string, 'delivery' | 'pickup'>>({});

  // Group cart items by farmer
  const cartGroups = useMemo(() => {
    const groups: Record<string, CartGroup> = {};
    
    cart.forEach(item => {
      const farmerId = item.farmer_id;
      if (!groups[farmerId]) {
        groups[farmerId] = {
          farmerId,
          farmerName: item.farmer_name || 'Farmer',
          items: [],
          deliveryType: deliveryTypes[farmerId] || 'delivery',
        };
      }
      groups[farmerId].items.push(item);
    });
    
    return Object.values(groups);
  }, [cart, deliveryTypes]);

  const handleDeliveryToggle = (farmerId: string) => {
    setDeliveryTypes(prev => ({
      ...prev,
      [farmerId]: prev[farmerId] === 'delivery' ? 'pickup' : 'delivery',
    }));
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    Alert.alert('Clear cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearCart();
          showToast('Cart cleared');
        },
      },
    ]);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
    showToast('Cart updated');
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    showToast('Item removed from cart');
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <TouchableOpacity onPress={handleClearCart} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {cart.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <TouchableOpacity style={styles.shopButton} onPress={() => router.push(Routes.buyerHome as any)}>
              <Text style={styles.shopButtonText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={cartGroups}
              keyExtractor={(item) => item.farmerId}
              contentContainerStyle={styles.cartList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: group }) => (
                <View style={styles.farmerGroup}>
                  <View style={styles.farmerHeader}>
                    <View style={styles.farmerInfo}>
                      <View style={styles.farmerIcon}>
                        <Ionicons name="person-outline" size={18} color={Colors.primary} />
                      </View>
                      <Text style={styles.farmerName}>{group.farmerName}</Text>
                    </View>
                    <View style={styles.deliveryToggle}>
                      <TouchableOpacity
                        style={[
                          styles.deliveryOption,
                          group.deliveryType === 'delivery' && styles.deliveryOptionActive,
                        ]}
                        onPress={() => handleDeliveryToggle(group.farmerId)}
                      >
                        <Ionicons 
                          name="bicycle-outline" 
                          size={14} 
                          color={group.deliveryType === 'delivery' ? Colors.white : Colors.textSecondary} 
                        />
                        <Text style={[
                          styles.deliveryOptionText,
                          group.deliveryType === 'delivery' && styles.deliveryOptionTextActive,
                        ]}>Delivery</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.deliveryOption,
                          group.deliveryType === 'pickup' && styles.deliveryOptionActive,
                        ]}
                        onPress={() => handleDeliveryToggle(group.farmerId)}
                      >
                        <Ionicons 
                          name="storefront-outline" 
                          size={14} 
                          color={group.deliveryType === 'pickup' ? Colors.white : Colors.textSecondary} 
                        />
                        <Text style={[
                          styles.deliveryOptionText,
                          group.deliveryType === 'pickup' && styles.deliveryOptionTextActive,
                        ]}>Pickup</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {group.items.map((item: any) => (
                    <View key={item.product_id} style={styles.cartItem}>
                      <Image
                        source={{ uri: item.image_url || 'https://placehold.co/100x100/2E7D32/FFFFFF/png?text=Product' }}
                        style={styles.itemImage}
                      />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemPrice}>SLL {item.price.toFixed(2)} / {item.unit}</Text>
                        <View style={styles.itemActions}>
                          <View style={styles.quantityControls}>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                            >
                              <Ionicons name="remove" size={14} color={Colors.text} />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{item.quantity}</Text>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                            >
                              <Ionicons name="add" size={14} color={Colors.text} />
                            </TouchableOpacity>
                          </View>
                          <TouchableOpacity onPress={() => handleRemove(item.product_id)} style={styles.deleteBtn}>
                            <Ionicons name="trash-outline" size={18} color={Colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.itemTotal}>
                        <Text style={styles.totalPrice}>SLL {(item.price * item.quantity).toFixed(2)}</Text>
                      </View>
                    </View>
                  ))}
                  
                  <View style={styles.groupTotal}>
                    <Text style={styles.groupTotalLabel}>Subtotal:</Text>
                    <Text style={styles.groupTotalValue}>
                      SLL {group.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            />

            <View style={styles.footer}>
              <View style={styles.footerRow}>
                <Text style={styles.footerLabel}>Subtotal:</Text>
                <Text style={styles.footerTotal}>SLL {total.toFixed(2)}</Text>
              </View>
              <View style={styles.footerRow}>
                <Text style={styles.footerLabel}>Platform Fee (4%):</Text>
                <Text style={styles.footerTotal}>SLL {(total * 0.04).toFixed(2)}</Text>
              </View>
              <View style={[styles.footerRow, styles.footerTotalRow]}>
                <Text style={styles.footerLabelBold}>Total:</Text>
                <Text style={styles.footerTotalBold}>SLL {(total * 1.04).toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push(Routes.buyerCheckout as any)}>
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
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
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 15,
    color: Colors.error,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
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
    marginTop: 4,
    marginBottom: 24,
    fontWeight: '600',
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  shopButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  cartList: {
    padding: 20,
    paddingBottom: 8,
  },
  farmerGroup: {
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  farmerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  farmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  farmerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  deliveryToggle: {
    flexDirection: 'row',
    gap: 6,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deliveryOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  deliveryOptionText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  deliveryOptionTextActive: {
    color: Colors.white,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 6,
  },
  itemTotal: {
    marginLeft: 12,
  },
  totalPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  groupTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  groupTotalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  groupTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  footer: {
    backgroundColor: Colors.surfaceGlass,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  footerTotalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLabelBold: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  footerTotal: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
  },
  footerTotalBold: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
});