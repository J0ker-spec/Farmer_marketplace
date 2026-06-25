/**
 * Generates Farmer Marketplace documentation as a Word-compatible .doc file.
 * Run: node scripts/generate-documentation.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'docs');
const outFile = path.join(outDir, 'Farmer_Marketplace_App_Documentation.doc');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const sections = [
  {
    title: '1. Executive Summary',
    body: `The Farmer Marketplace is a mobile application designed to connect farmers in Sierra Leone directly with buyers, eliminating unnecessary intermediaries and creating a transparent, efficient agricultural commerce platform. Built with React Native and Expo, the application delivers a native mobile experience on Android, iOS, and web while leveraging Google Firebase as a fully managed backend.

This document provides a comprehensive technical and functional overview of the application: its purpose, architecture, technology choices, user journeys, data model, security considerations, and deployment guidance. It is intended for developers, project stakeholders, academic reviewers, and anyone evaluating or maintaining the system.

The platform supports three distinct user roles—Buyers, Farmers, and Administrators—each with tailored workflows. Buyers browse fresh produce, manage carts, complete checkout, track orders, and message farmers. Farmers list products, manage inventory, fulfill orders, and communicate with customers after admin verification. Administrators approve farmer accounts, monitor transactions, and manage the user base.

The application was migrated from Supabase to Firebase to unify authentication, real-time data, and file storage under a single ecosystem well suited for mobile deployment. The user interface follows a futuristic agri-tech design language featuring dark surfaces, neon green accents, glass-style cards, and clear visual hierarchy.`,
  },
  {
    title: '2. Introduction and Background',
    body: `Agriculture remains a cornerstone of Sierra Leone's economy, yet many smallholder farmers struggle to reach urban buyers efficiently. Traditional supply chains often involve multiple middlemen, reducing farmer profits and increasing prices for consumers. Digital marketplaces offer a proven model for disintermediation, but they must be accessible on low-cost smartphones, work with intermittent connectivity, and support local payment preferences such as Orange Money and Afrimoney.

The Farmer Marketplace project addresses these challenges by providing a role-based mobile application where verified farmers can list products with images, prices, and stock levels, while buyers can search, filter, add items to a cart, and place orders with their preferred delivery and payment methods. An admin layer ensures quality control through farmer verification before listings go live.

The application is developed as a single codebase using Expo Router for file-based navigation, TypeScript for type safety, and Firebase for backend services. This approach minimizes infrastructure overhead while remaining scalable as user adoption grows.`,
  },
  {
    title: '3. Problem Statement',
    body: `Small-scale farmers frequently lack direct access to retail buyers, forcing reliance on informal markets with unpredictable pricing. Buyers, in turn, have limited visibility into product freshness, farmer location, and fair pricing. Existing generic e-commerce platforms are not optimized for perishable agricultural goods, local currency (Sierra Leonean Leone), or mobile-money payment flows common in West Africa.

Key problems addressed by this application include: fragmented communication between farmers and buyers; lack of order tracking and payment status visibility; difficulty verifying farmer credentials; absence of a centralized product catalog; and poor mobile UX on budget devices. The Farmer Marketplace consolidates discovery, ordering, messaging, and administration into one cohesive mobile experience.`,
  },
  {
    title: '4. Solution Overview',
    body: `The solution is a three-sided marketplace mobile app with the following core capabilities:

• Product catalog with search, category filters, and real-time Firestore updates
• Shopping cart persisted locally via AsyncStorage (or localStorage on web)
• Multi-step checkout with delivery method, payment selection, and order review
• Order confirmation screen with clear next steps
• Order tracking for buyers and order management for farmers
• In-app messaging between buyers and farmers
• Product reviews and ratings
• Farmer verification workflow with pending approval screen
• Admin dashboard for user management and transaction monitoring
• Demo mode for testing without live Firebase accounts
• Recently Sold section showcasing live marketplace activity

The futuristic UI employs a dark theme (#0A0F0D background) with neon green primary accents (#00E676), glass-effect cards, glowing buttons, and consistent spacing—creating a modern agri-tech aesthetic distinct from generic e-commerce apps.`,
  },
  {
    title: '5. Technology Stack',
    body: `Frontend Framework: React Native 0.81 with Expo SDK 54 provides cross-platform development, hot reload, and simplified native module access. Expo Router 6 enables file-based routing analogous to Next.js, with route groups for auth, buyer, farmer, and admin sections.

Language: TypeScript 5.9 ensures compile-time type checking across hooks, components, and services.

State Management: React Context API powers the shopping cart (CartContext) and toast notifications (ToastContext). Custom hooks encapsulate auth, products, orders, and messages logic.

Backend — Firebase:
• Firebase Authentication: Email/password sign-up and login; phone OTP flow with demo fallback
• Cloud Firestore: NoSQL document database for users, products, orders, reviews, messages
• Firebase Storage: Product image uploads with client-side compression via expo-image-manipulator

Key Libraries:
• @react-native-async-storage/async-storage — cart and demo profile persistence
• expo-image-picker / expo-image-manipulator — product photos
• firebase 12.x — unified web SDK for Auth, Firestore, Storage
• @expo/vector-icons — Ionicons throughout the UI
• react-native-reanimated / gesture-handler — smooth interactions`,
  },
  {
    title: '6. System Architecture',
    body: `The application follows a client-server architecture where the Expo mobile client communicates directly with Firebase services. There is no custom Node.js API layer; business logic executes on the client with Firestore security rules (recommended for production) enforcing access control server-side.

Layer breakdown:
1. Presentation Layer — screens in app/ directory, reusable components in components/, UI primitives in components/ui/
2. Application Layer — hooks (useAuth, useProducts, useOrders, useMessages) orchestrate data fetching and side effects
3. Service Layer — services/firebase.ts singleton initializes Firebase; services/mockData.ts provides demo datasets
4. Data Layer — Firestore collections: users, products, orders, reviews, messages

Navigation flow begins at app/index.tsx → splash → role-based redirect. Route paths are centralized in utils/routes.ts to prevent broken links. Document ID normalization (id + legacy alias fields like product_id, order_id) lives in utils/documents.ts to prevent navigation crashes.

Real-time updates use Firestore onSnapshot listeners in useProducts and useOrders, so listings and order status reflect changes without manual refresh.`,
  },
  {
    title: '7. Firebase Configuration',
    body: `Firebase is initialized once in services/firebase.ts using environment variables:

EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID

These are loaded via Expo's env system from .env.local at build time. The initializeApp pattern guards against duplicate initialization using getApps().

Firestore collections should be indexed for compound queries used in the app—for example, products filtered by status and ordered by created_at, and orders filtered by buyer_id or farmer_id ordered by order_date. Without composite indexes, Firestore will return an error with a link to create the required index in the Firebase Console.

Storage bucket product-images/ stores compressed JPEG uploads from farmers. Public read access or signed URLs may be configured depending on security requirements.`,
  },
  {
    title: '8. Authentication and User Profiles',
    body: `Authentication is handled by Firebase Auth with profiles stored in Firestore users collection.

Registration flows:
• Email registration via register-buyer.tsx and register-farmer.tsx
• Legacy combined register.tsx supports buyer/farmer toggle
• Phone flow: phone-login → otp-verify → registration (demo OTP: 123456)

User profile document fields:
• user_id (matches Firebase Auth UID)
• name, email, phone, role (buyer | farmer | admin)
• verified (boolean — farmers default false until admin approval)
• farm_name, location, crops (farmer-specific)
• created_at (ISO timestamp)

useAuth hook subscribes to onAuthStateChanged, fetches Firestore profile, and maintains real-time profile sync via onSnapshot. Demo mode stores mock profiles in AsyncStorage for offline exploration.

Role-based routing via getRoleHomeRoute():
• Buyer → /(buyer)/dashboard
• Verified farmer → /(farmer)/dashboard
• Unverified farmer → /pending-approval
• Admin → /(admin)/admin-dashboard`,
  },
  {
    title: '9. Buyer User Journey',
    body: `1. Splash / Login — user authenticates or uses demo mode
2. Buyer Dashboard — stats (orders, spending), quick actions (Shop, Cart, Messages, Orders)
3. Home — futuristic marketplace feed with Recently Sold carousel (3 demo items), search, category chips, product cards
4. Product Details — images, price, stock, freshness indicator, farmer info, call/message actions, reviews
5. Cart — items grouped by farmer, quantity controls, delivery toggle per farmer, platform fee calculation
6. Checkout — delivery method, payment method (Orange Money, Afrimoney, bank transfer, cash on delivery), order review
7. Order Confirmation — success state with links to orders and continued shopping
8. Orders — OrderItem cards with status badges and payment indicators
9. Messages — conversation list and MessageView for direct chat

Cart data persists across sessions. Checkout creates one Firestore order document per cart line item with status pending and payment_status unpaid.`,
  },
  {
    title: '10. Farmer User Journey',
    body: `1. Registration — farmer signs up; profile created with verified: false
2. Pending Approval — professional waiting screen with status check and auto-redirect when admin approves
3. Farmer Dashboard — stats (active listings, pending orders, monthly earnings), quick actions, recent orders
4. My Products — list with edit/delete; soft delete sets status to removed
5. Add/Edit Product — image picker (gallery/camera), compression, Firebase Storage upload, Firestore document create/update
6. Farmer Orders — confirm, ship, deliver workflow; call buyer action

Unverified farmers see a banner on the dashboard and cannot fully publish until approved. The FAB (+) button provides quick access to add new products.`,
  },
  {
    title: '11. Administrator User Journey',
    body: `Admin users access the Admin Dashboard showing aggregate metrics: total users, pending farmers, total orders, and revenue sum.

Key admin screens:
• User Management — filter by role (all, farmer, buyer, admin); approve farmers by setting verified: true
• Transaction Monitor — all orders with buyer/farmer resolution, payment status updates (paid/refunded)

Admin demo account available via login screen demo button. Production admins should be created manually in Firestore with role: admin and verified: true.`,
  },
  {
    title: '12. Data Model and ID Standards',
    body: `Every Firestore document exposed to the UI includes both id and a legacy alias field for backward compatibility:

Entity | id field | alias field
Product | id | product_id
Order | id | order_id
Review | id | review_id
Message | id | message_id
User | id | user_id

Products: farmer_id, name, description, price, unit, quantity, category, status (active|sold_out|removed), image_url, created_at

Orders: product_id, buyer_id, farmer_id, quantity, total_price, payment_method, delivery_address, status, payment_status, order_date

Reviews: product_id, buyer_id, rating, comment, created_at

Messages: sender_id, recipient_id, content, is_read, created_at, optional product_id/order_id

MOCK_SOLD_ITEMS provides three recently sold products (Organic Cassava, Fresh Okra, Local Honey) displayed in the buyer home Recently Sold section.`,
  },
  {
    title: '13. UI/UX Design System',
    body: `The futuristic theme is defined in constants/colors.ts:

• Background: #0A0F0D (deep charcoal-green)
• Primary: #00E676 (neon green)
• Surface: #1A2420 (elevated cards)
• Text: #F0FFF4 (high contrast)
• Accent: #00B8D4 (cyan highlights)
• Sold badge: #FF6B6B

Components:
• GradientBackground — layered orbs simulating depth without native gradient deps
• GlassCard — translucent bordered containers
• ProductCard — category pill, image overlay, glowing add-to-cart CTA
• SoldItemCard — compact horizontal card with SOLD badge
• EmptyState / LoadingState — consistent feedback patterns

Typography uses bold 800-weight headings, letter-spacing on labels, and uppercase micro-labels (e.g., WELCOME BACK, AGRI-TECH PLATFORM). StatusBar is set to light content globally in _layout.tsx.`,
  },
  {
    title: '14. Hooks and Business Logic',
    body: `useAuth — Firebase auth state, profile fetch, mock profile support, farmer pending redirect, signOut

useProducts — Firestore query with optional farmerId filter; active products for marketplace; real-time onSnapshot; withProductIds normalization

useOrders — buyer/farmer filtered queries; resolveOrders joins product and buyer documents in memory (Firestore has no SQL joins); real-time updates

useMessages — dual queries for sent/received messages merged client-side; conversation builder; sendMessage, markAsRead

useDebounce — search input throttling on home screen

useTranslation — i18n support for English and Krio on registration screens

CartContext — add, update, remove, clear, total calculation with persistent storage`,
  },
  {
    title: '15. Payment and Checkout Logic',
    body: `Checkout supports four payment methods aligned with Sierra Leone preferences:
• Orange Money — simulated USSD prompt delay
• Afrimoney — simulated USSD prompt delay
• Bank Transfer — receipt upload UI (client-side state)
• Cash on Delivery — only available when delivery method is delivery

Platform fee is calculated at 4% on cart subtotal. Delivery adds SLL 5,000 when delivery is selected.

Each cart item generates a separate order document. On success, cart clears and user navigates to order-confirmation. Farmers receive orders in farmer-orders with status workflow: pending → confirmed → shipped → delivered (or cancelled).`,
  },
  {
    title: '16. Messaging and Reviews',
    body: `Messaging uses two Firestore queries (sender_id and recipient_id) because Firestore cannot OR across fields in a single query. Results merge, deduplicate, and enrich with user names fetched from users collection.

MessageView provides chat bubbles, timestamps, and send functionality with optional product context from product details screen.

ProductReviews component fetches reviews by product_id, computes average rating and distribution, and allows authenticated buyers to create or update their review. Buyer names resolved via secondary user fetches with in-memory cache.`,
  },
  {
    title: '17. Security Considerations',
    body: `Production deployment requires Firestore Security Rules restricting:
• users: read own profile; admin read all; write own document on create
• products: farmers write own products; all authenticated read active products
• orders: buyers create; farmers/buyers read own orders; farmers update status
• messages: participants only
• reviews: authenticated buyers create one per product

Firebase Storage rules should limit uploads to authenticated farmers under size thresholds. API keys in EXPO_PUBLIC_ variables are visible in client bundles—this is expected; security relies on rules, not key secrecy.

Demo mode bypasses Firebase Auth—disable or gate in production builds.`,
  },
  {
    title: '18. Testing and Demo Mode',
    body: `Demo accounts in mockData.ts:
• customer@demo.com — buyer
• farmer@demo.com — verified farmer
• admin@demo.com — administrator

Login screen demo buttons call setMockProfile and navigate directly to role dashboards. Phone OTP demo code 123456 routes to registration with phone pre-filled.

Run npm start to launch Expo dev server. Use Expo Go on device or emulator. TypeScript check: npx tsc --noEmit.`,
  },
  {
    title: '19. Deployment Guide',
    body: `1. Create Firebase project and enable Auth, Firestore, Storage
2. Copy config to .env.local
3. Deploy Firestore indexes for compound queries
4. Configure security rules
5. Build with EAS: eas build --platform android / ios
6. Submit to Google Play / App Store

Environment separation: use distinct Firebase projects for dev/staging/production. Seed initial admin user via Firebase Console.`,
  },
  {
    title: '20. Future Enhancements',
    body: `Recommended roadmap items:
• Push notifications for order status and messages (FCM)
• Geolocation and distance-based farmer sorting
• Escrow payment integration with Orange Money API
• Offline-first cart sync with conflict resolution
• Analytics dashboard for farmers
• Multi-language expansion beyond English/Krio
• Barcode scanning for inventory
• AI-powered crop pricing suggestions`,
  },
  {
    title: '21. Conclusion',
    body: `The Farmer Marketplace demonstrates a production-quality mobile architecture using modern React Native tooling and Firebase backend services. By connecting farmers directly to buyers, verifying seller credentials, and providing end-to-end order and messaging flows, the platform addresses real agricultural commerce challenges in Sierra Leone.

The futuristic UI differentiates the product visually while maintaining usability through consistent components, loading states, and clear navigation. The codebase is organized for maintainability with centralized routes, document ID helpers, and separation of concerns across hooks, services, and screens.

This documentation should serve as the authoritative reference for understanding, extending, and deploying the Farmer Marketplace application.`,
  },
  {
    title: 'Appendix A: Screen Inventory',
    body: `Auth: login, register, register-buyer, register-farmer, role-select, phone-login, otp-verify
Buyer: dashboard, home, cart, checkout, orders, product-details
Farmer: dashboard, my-products, add-edit-product, farmer-orders
Admin: admin-dashboard, user-management, transaction-monitor
Shared: splash, pending-approval, order-confirmation, messages, index`,
  },
  {
    title: 'Appendix B: File Structure',
    body: `app/ — Expo Router screens
components/ — ProductCard, OrderItem, MessageView, UI primitives
context/ — CartContext, ToastContext
hooks/ — useAuth, useProducts, useOrders, useMessages, useDebounce, useTranslation
services/ — firebase.ts, mockData.ts
utils/ — routes.ts, documents.ts, currency.ts
constants/ — colors.ts, categories.ts, designSystem.ts, districts.ts
i18n/ — translation strings`,
  },
];

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

let bodyHtml = '';
for (const s of sections) {
  bodyHtml += `<h1 style="font-size:18pt;color:#2D6A4F;margin-top:24pt;page-break-before:always;">${esc(s.title)}</h1>`;
  for (const para of s.body.split('\n\n')) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('•')) {
      bodyHtml += '<ul>';
      for (const line of trimmed.split('\n')) {
        if (line.trim().startsWith('•')) {
          bodyHtml += `<li style="margin-bottom:6pt;line-height:1.5;">${esc(line.replace(/^•\s*/, ''))}</li>`;
        }
      }
      bodyHtml += '</ul>';
    } else if (trimmed.includes('|') && trimmed.includes('Entity')) {
      bodyHtml += `<pre style="font-family:Consolas;font-size:10pt;background:#f5f5f5;padding:12pt;">${esc(trimmed)}</pre>`;
    } else {
      bodyHtml += `<p style="text-align:justify;line-height:1.6;margin-bottom:12pt;font-size:11pt;">${esc(trimmed).replace(/\n/g, '<br/>')}</p>`;
    }
  }
}

const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:w="urn:schemas-microsoft-com:office:word"
 xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Farmer Marketplace App Documentation</title>
<!--[if gte mso 9]><xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
</w:WordDocument>
</xml><![endif]-->
<style>
@page { size: A4; margin: 2.54cm; }
body { font-family: Calibri, Arial, sans-serif; color: #1a1a1a; }
h1:first-of-type { page-break-before: auto; }
.cover { text-align: center; padding-top: 120pt; page-break-after: always; }
.cover h1 { font-size: 32pt; color: #2D6A4F; }
.cover p { font-size: 14pt; color: #666; margin-top: 12pt; }
</style>
</head>
<body>
<div class="cover">
  <h1>Farmer Marketplace</h1>
  <p>Mobile Application — Technical Documentation</p>
  <p>React Native · Expo · Firebase</p>
  <p>Sierra Leone Agricultural E-Commerce Platform</p>
  <p style="margin-top:48pt;font-size:12pt;">Version 1.0 · ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
</div>
${bodyHtml}
</body>
</html>`;

fs.writeFileSync(outFile, html, 'utf8');
console.log('Documentation written to:', outFile);
console.log('Open in Microsoft Word and Save As .docx if needed.');
