import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { PAYMENT_METHODS } from '../../constants/categories';
import { Colors } from '../../constants/colors';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { db } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Routes } from '../../utils/routes';

export default function CheckoutScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { cart, total, clearCart } = useCart();
  const { showToast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<typeof PAYMENT_METHODS[number]>(PAYMENT_METHODS[0]);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [ussdSent, setUssdSent] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);

  const placeOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty. Add items before checking out.');
      return;
    }

    if (!profile?.user_id) {
      Alert.alert('Error', 'Unable to place order. Please sign in again.');
      return;
    }

    if (deliveryMethod === 'delivery' && !deliveryAddress) {
      Alert.alert('Error', 'Please enter delivery address');
      return;
    }

    try {
      setLoading(true);

      for (const item of cart) {
        const orderRef = doc(collection(db, 'orders'));
        await setDoc(orderRef, {
          order_id: orderRef.id,
          product_id: item.product_id,
          buyer_id: profile?.user_id,
          farmer_id: item.farmer_id,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
          payment_method: paymentMethod,
          delivery_address: deliveryMethod === 'delivery' ? deliveryAddress : null,
          status: 'pending',
          payment_status: 'unpaid',
          order_date: new Date().toISOString(),
        });
      }

      if (paymentMethod === 'orange_money' || paymentMethod === 'afrimoney') {
        // Simulate USSD prompt
        setUssdSent(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      clearCart();
      router.replace(Routes.orderConfirmation as any);
      showToast('Order placed successfully');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Method</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[styles.optionCard, deliveryMethod === 'pickup' && styles.optionCardActive]}
              onPress={() => setDeliveryMethod('pickup')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="location-outline"
                size={22}
                color={deliveryMethod === 'pickup' ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.optionText, deliveryMethod === 'pickup' && styles.optionTextActive]}>Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionCard, deliveryMethod === 'delivery' && styles.optionCardActive]}
              onPress={() => setDeliveryMethod('delivery')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="car-outline"
                size={22}
                color={deliveryMethod === 'delivery' ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.optionText, deliveryMethod === 'delivery' && styles.optionTextActive]}>Delivery</Text>
            </TouchableOpacity>
          </View>

          {deliveryMethod === 'delivery' && (
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter delivery address"
                placeholderTextColor={Colors.textSecondary}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method}
              style={[styles.paymentOption, paymentMethod === method && styles.paymentOptionActive]}
              onPress={() => {
                if (method === 'cash_on_delivery' && deliveryMethod === 'pickup') {
                  showToast('Cash on delivery is only available for delivery orders');
                  return;
                }
                setPaymentMethod(method);
              }}
              disabled={method === 'cash_on_delivery' && deliveryMethod === 'pickup'}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, paymentMethod === method && styles.radioActive]}>
                {paymentMethod === method && <View style={styles.radioDot} />}
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={[styles.paymentText, paymentMethod === method && styles.paymentTextActive]}>
                  {method === 'orange_money' && 'Orange Money'}
                  {method === 'afrimoney' && 'Afrimoney'}
                  {method === 'bank_transfer' && 'Bank Transfer'}
                  {method === 'cash_on_delivery' && 'Cash on Delivery'}
                </Text>
                {method === 'cash_on_delivery' && (
                  <Text style={styles.paymentNote}>Only for delivery orders</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {(paymentMethod === 'orange_money' || paymentMethod === 'afrimoney') && (
            <View style={styles.paymentInfoBox}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.paymentInfoText}>
                You will receive a USSD prompt on your phone to confirm payment.
              </Text>
            </View>
          )}

          {paymentMethod === 'bank_transfer' && (
            <View style={styles.paymentInfoBox}>
              <TouchableOpacity style={styles.uploadButton} onPress={() => setReceiptUploaded(true)} activeOpacity={0.7}>
                <Ionicons name="cloud-upload-outline" size={20} color={Colors.primary} />
                <Text style={styles.uploadButtonText}>
                  {receiptUploaded ? 'Receipt Uploaded' : 'Upload Bank Transfer Receipt'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Review</Text>
          <View style={styles.cartReview}>
            {cart.map((item) => (
              <View key={item.product_id} style={styles.cartItemReview}>
                <Image
                  source={{ uri: item.image_url || 'https://placehold.co/80x80/2E7D32/FFFFFF/png?text=Product' }}
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemUnit}>{item.unit}</Text>
                  <View style={styles.itemPricing}>
                    <Text style={styles.itemQuantity}>x {item.quantity}</Text>
                    <Text style={styles.itemUnitPrice}>SLL {item.price.toFixed(2)}</Text>
                  </View>
                </View>
                <Text style={styles.itemTotal}>SLL {(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.costBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Subtotal</Text>
              <Text style={styles.breakdownValue}>SLL {total.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Platform Fee (4%)</Text>
              <Text style={styles.breakdownValue}>SLL {(total * 0.04).toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Delivery</Text>
              <Text style={[styles.breakdownValue, { color: Colors.primary }]}>
                {deliveryMethod === 'delivery' ? 'SLL 5,000' : 'Free'}
              </Text>
            </View>
            <View style={[styles.breakdownRow, styles.breakdownTotal]}>
              <Text style={styles.breakdownLabelTotal}>Total Amount</Text>
              <Text style={styles.breakdownValueTotal}>
                SLL {(total * 1.04 + (deliveryMethod === 'delivery' ? 5000 : 0)).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={placeOrder} disabled={loading} activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  section: {
    backgroundColor: Colors.surfaceGlass,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  optionCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  optionTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: Colors.text,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  paymentOptionActive: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  paymentText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  paymentTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  paymentInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryGlow,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '40',
  },
  paymentInfoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  uploadButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  cartReview: {
    marginBottom: 16,
    gap: 12,
  },
  cartItemReview: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  itemUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  itemPricing: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  itemUnitPrice: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  costBreakdown: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  breakdownTotal: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  breakdownLabelTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  breakdownValueTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryItemName: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  summaryItemQty: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginHorizontal: 12,
  },
  summaryItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  summaryTotalText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  summaryTotalPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
});