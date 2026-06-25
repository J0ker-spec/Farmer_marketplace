Manual and Automated Testing Guide

1. Quick checks (local)

- Run typecheck and lint:

```bash
npm run check
```

- Start the app with Expo:

```bash
npm start
```

2. Manual test checklist

- Guest flows:
  - Open app, browse products, search, filter
  - Open product details, change quantity, add to cart
  - Verify cart count updates and toast appears
  - Attempt checkout as demo customer

- Auth flows:
  - Register new buyer and farmer accounts (ensure validation)
  - Login, logout, session persists
  - Use demo accounts: `customer@demo.com`, `admin@demo.com`, `farmer@demo.com`

- Cart & checkout:
  - Add/remove/update quantity
  - Place order (simulate payment)
  - Verify orders page shows sample orders when backend empty

- Admin / Farmer:
  - Admin: view dashboard, user management, approve farmers
  - Farmer: add/edit/remove products, view orders

3. Edge cases

- Network offline (toggle airplane mode) - app should show fallback data where possible
- Empty cart checkout should be blocked
- Invalid login should show friendly error

4. Automated

- `npm run check` validates TypeScript and lint

5. Notes

- Supabase credentials are read from .env.local or app config. If missing, the app falls back to demo/mock data and logs a warning.
