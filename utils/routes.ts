/** Central route paths — use group-qualified paths to avoid dashboard conflicts. */

export const Routes = {
  splash: '/splash',
  login: '/(auth)/login',
  phoneLogin: '/(auth)/phone-login',
  otpVerify: '/(auth)/otp-verify',
  roleSelect: '/(auth)/role-select',
  registerBuyer: '/(auth)/register-buyer',
  registerFarmer: '/(auth)/register-farmer',
  pendingApproval: '/pending-approval',
  orderConfirmation: '/order-confirmation',
  messages: '/messages',

  buyerDashboard: '/(buyer)/dashboard',
  buyerHome: '/(buyer)/home',
  buyerCart: '/(buyer)/cart',
  buyerCheckout: '/(buyer)/checkout',
  buyerOrders: '/(buyer)/orders',
  buyerProductDetails: '/(buyer)/product-details',

  farmerDashboard: '/(farmer)/dashboard',
  farmerProducts: '/(farmer)/my-products',
  farmerAddProduct: '/(farmer)/add-edit-product',
  farmerOrders: '/(farmer)/farmer-orders',

  adminDashboard: '/(admin)/admin-dashboard',
  adminUsers: '/(admin)/user-management',
  adminTransactions: '/(admin)/transaction-monitor',
} as const;

export function getRoleHomeRoute(role?: string, verified?: boolean) {
  if (role === 'admin') return Routes.adminDashboard;
  if (role === 'farmer') {
    return verified ? Routes.farmerDashboard : Routes.pendingApproval;
  }
  if (role === 'buyer') return Routes.buyerHome;
  return Routes.login;
}
