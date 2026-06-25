# Farmer Marketplace - Setup & Testing Guide

## 🔧 Database Setup Instructions

Run the following SQL in your Supabase dashboard to set up the complete database:

**1. Copy and paste the contents of `database_schema.sql` into the SQL Editor**
**2. Execute the query**

This will create all tables with the correct RLS policies and seed data.

## 👤 Test Account Credentials

**Email:** `olujonesvidal@gmail.com`  
**Password:** `@francess123`  
**Role:** Buyer  
**Name:** Olu Jones

### Create Test Account in Supabase:

1. Go to Supabase Dashboard → Authentication
2. Click "Add user"
3. Email: `olujonesvidal@gmail.com`
4. Password: `@francess123`
5. Click "Create user"

The system will automatically create the buyer profile when logging in if it doesn't exist.

## ✅ Features Implemented

### Authentication
- ✅ Sign Up with email validation
- ✅ Login with Supabase Auth
- ✅ Password hashing (handled by Supabase)
- ✅ Session persistence
- ✅ Auto-logout on sign out

### Shopping Features
- ✅ Browse products by category
- ✅ Product details with images
- ✅ Add to cart
- ✅ Cart management (edit quantities, remove items)
- ✅ Checkout with delivery options
- ✅ Multiple payment methods
- ✅ Order tracking with fulfillment status

### Product Reviews
- ✅ Leave ratings and reviews
- ✅ View product ratings distribution
- ✅ Edit existing reviews
- ✅ Average rating display

### Messaging System
- ✅ Real-time messaging between buyers and sellers
- ✅ Message conversations view
- ✅ Direct messaging from product details
- ✅ Unread message counts

### Buyer Dashboard
- ✅ Order statistics (total orders, pending, delivered)
- ✅ Total spending tracker
- ✅ Quick action buttons (Shop, Cart, Messages, Orders)
- ✅ Recent orders preview
- ✅ Account settings (clickable)
- ✅ Sign out

### Orders & Fulfillment
- ✅ Order placement
- ✅ Fulfillment tracking (Pending → Processing → Packed → Shipped → Out for Delivery → Delivered)
- ✅ Payment status display
- ✅ Tracking numbers (when available)
- ✅ Delivery address

## 🐛 Fixed Issues

1. **Database Schema** - Removed password_hash storage, added messaging table
2. **RLS Policies** - Made permissive for development (will need to restrict in production)
3. **Signup Flow** - Removed storing plain passwords
4. **Navigation Loops** - Fixed circular navigation in auth flow
5. **UI Interactivity** - Made all relevant elements clickable

## 📱 Navigation Flow

```
Login/Register
    ↓
Splash (checks auth state)
    ↓
Buyer: Dashboard → Shop → Home
Farmer: Farmer Dashboard
Admin: Admin Dashboard

From Dashboard:
- Shop → Browse Products → Product Details (Message/Call Farmer) → Add to Cart
- Cart → Review Items → Checkout → Order Confirmation
- Messages → View Conversations → Message View
- Orders → Order Details with tracking
```

## 🚀 How to Test

### Test Registration
1. Go to Register screen
2. Fill in form with:
   - Name: Test User
   - Phone: +232123456789
   - Email: test@example.com
   - Password: Password123!
3. Select role (buyer/farmer)
4. Click "Sign Up"
5. Should redirect to login or dashboard

### Test Login with Test Account
1. Go to Login screen
2. Email: `olujonesvidal@gmail.com`
3. Password: `@francess123`
4. Click "Sign In"
5. Should navigate to buyer dashboard

### Test Shopping Flow
1. From dashboard, click "Shop"
2. Browse products
3. Click on a product
4. Click "Message" to chat with farmer OR "Call" to phone
5. Adjust quantity and click "Add to Cart"
6. View cart, adjust items
7. Proceed to checkout
8. Select delivery method and payment method
9. Click "Place Order"
10. View order in "Orders" section

### Test Messaging
1. From dashboard, click "Messages"
2. From product details, click "Message"
3. Type message and click send
4. Real-time message sync

### Test Reviews
1. Go to product details
2. Scroll down to "Customer Reviews"
3. Click "Add a Review"
4. Select star rating
5. Add comment
6. Click "Post Review"
7. See review appear in list

## ⚙️ Environment Setup

Make sure you have:
1. `.env.local` file with:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. Supabase storage bucket:
   ```
   supabase storage buckets create product-images --public
   ```

## 📋 Production TODOs

1. **RLS Policies** - Implement proper row-level security (currently permissive for dev)
2. **Password Requirements** - Add stronger validation
3. **Email Verification** - Implement email confirmation
4. **Payment Integration** - Connect real payment gateway
5. **File Uploads** - Implement product image uploads to storage
6. **Notifications** - Add push notifications for new messages/orders
7. **Rate Limiting** - Add API rate limiting
8. **Logging** - Implement comprehensive logging

## 🆘 Troubleshooting

**Issue: "Supabase URL not detected"**
- Check `.env.local` file exists
- Verify `EXPO_PUBLIC_SUPABASE_URL` is set correctly
- Restart the app

**Issue: Login fails**
- Ensure test account exists in Supabase Auth
- Check email/password match exactly
- Verify Supabase URL and key are correct

**Issue: Messages not syncing**
- Check Supabase real-time subscriptions enabled
- Verify messages table permissions
- Check network connection

**Issue: Products not loading**
- Verify products table has data
- Check RLS policies allow SELECT
- Check product status is 'active'

## 📞 Support

For issues or questions, refer to:
- Supabase Documentation: https://supabase.com/docs
- Expo Documentation: https://docs.expo.dev
- React Native Docs: https://reactnative.dev
