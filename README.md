# Farmer Marketplace

A mobile marketplace application connecting farmers in Sierra Leone directly with buyers, built with React Native (Expo) and Firebase.

## Tech Stack

- **Frontend**: React Native (Expo Router)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Auth**: Firebase Email/Password + Phone OTP (demo mode supported)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage for product images

## Setup

### 1. Firebase Setup

1. Create a project on [Firebase Console](https://console.firebase.google.com/)
2. Enable **Email/Password** authentication
3. Create a Firestore database
4. Create a `product-images` Storage bucket
5. Copy your web app config values

### 2. Environment Variables

Create `.env.local` from `.env.example`:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run the App

```bash
npm install
npm start
```

## Firestore Collections

| Collection | Key Fields |
|------------|------------|
| `users` | role, verified, created_at, farm_name |
| `products` | farmer_id, status, created_at, price |
| `orders` | buyer_id, farmer_id, order_date, status |
| `reviews` | product_id, buyer_id, rating |
| `messages` | sender_id, recipient_id, created_at |

## Demo Mode

On the login screen, use **Demo as Buyer**, **Demo as Farmer**, or **Demo as Admin** to explore without Firebase accounts.

Phone login demo OTP: `123456`

## User Roles

- **Buyer** — browse products, cart, checkout, orders, messaging
- **Farmer** — manage products, fulfill orders (requires admin verification)
- **Admin** — approve farmers, monitor transactions, manage users
