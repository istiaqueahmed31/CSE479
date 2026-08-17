# E-Commarce BD

Bazaar Deals BD is a bilingual e-commerce storefront built for the Bangladesh market. It includes a customer-facing shopping experience, Supabase-powered authentication and order handling, and an admin dashboard for managing products, categories, banners, orders, and inventory.

## Features

- Bilingual UI with Bangla and English content
- Product listing, filtering, sorting, and product detail pages
- Shopping cart with local storage persistence
- Checkout flow for guest and logged-in users
- Order tracking by order ID
- Supabase authentication for customer login and registration
- Admin dashboard with sales overview charts
- Admin management for products, categories, banners, orders, and inventory
- Image upload and resizing for product, category, and banner assets
- Inventory controls with stock status, reserved stock, and low-stock thresholds

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui + Radix UI
- React Router
- TanStack Query
- Supabase
- Vitest
- Playwright

## Project Structure

```text
src/
  components/        Reusable UI, layout, home, and admin components
  contexts/          Auth and cart state
  i18n/              Bangla/English translations and language provider
  integrations/      Supabase client and generated types
  lib/               Shared helpers such as image resizing
  pages/             Customer and admin pages
  test/              Test setup and example tests

supabase/
  migrations/        Database schema and updates
  config.toml        Supabase local configuration
```

## Main Routes

### Storefront

- `/` - Home page
- `/products` - Product catalog
- `/product/:slug` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/track-order` - Order tracking
- `/auth` and `/login` - Customer authentication
- `/dashboard` - Customer dashboard

### Admin

- `/admin` - Admin overview
- `/admin/products` - Manage products
- `/admin/orders` - Manage orders and update status
- `/admin/categories` - Manage categories
- `/admin/banners` - Manage hero and promo banners
- `/admin/inventory` - Track stock, thresholds, and overrides

## Database Overview

The app is connected to Supabase and uses tables such as:

- `products`
- `categories`
- `orders`
- `order_items`
- `profiles`
- `hero_banners`
- `promo_banners`
- `reviews`
- `site_settings`
- `user_roles`

It also relies on database functions like:

- `has_role` for admin permission checks
- `compute_stock_status` for inventory logic
- `release_order_stock` for stock handling workflows

## Environment Variables

Create a `.env` file with the following values:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm or Bun
- A Supabase project

### Install dependencies

Using npm:

```bash
npm install
```

Using Bun:

```bash
bun install
```

### Run the development server

Using npm:

```bash
npm run dev
```

Using Bun:

```bash
bun run dev
```

Then open the local Vite URL shown in your terminal.

## Available Scripts

```bash
npm run dev         # Start local development server
npm run build       # Create production build
npm run build:dev   # Build in development mode
npm run lint        # Run ESLint
npm run test        # Run Vitest once
npm run test:watch  # Run Vitest in watch mode
npm run preview     # Preview production build
```

## Admin Access

Admin access is controlled through Supabase roles. A user must have the `admin` role in the `user_roles` table for admin-only features to be available.

## Notes

- Cart data is persisted in the browser with local storage.
- Checkout currently supports cash on delivery and online payment selection in the UI.
- Image uploads are used across products, categories, and banners.
- The app is designed around Supabase as the main backend.

## Future Improvements

- Add payment gateway integration for online payments
- Add automated order notifications
- Expand customer dashboard features
- Add stronger test coverage for critical purchase flows
- Improve analytics and reporting in the admin panel

## License

This project is private and own my istiaque ahmed licensed to SOFT CORE LTD and intended for internal or client use only.
