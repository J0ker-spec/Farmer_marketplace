import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from '../components/Toast';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';

export default function RootLayout() {
  return (
    <ToastProvider>
      <CartProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0F0D' } }} />
        <Toast />
      </CartProvider>
    </ToastProvider>
  );
}
