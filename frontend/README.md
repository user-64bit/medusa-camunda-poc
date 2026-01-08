# Medusa Frontend

A modern Next.js frontend for the Medusa e-commerce platform with Camunda workflow integration.

## Features

- **Product Catalog**: Browse products with categories and search
- **Customer Authentication**: Medusa native customer auth
- **Shopping Cart**: Full cart management with real-time updates
- **Checkout Flow**: Multi-step checkout with Stripe payment support
- **Order Tracking**: Real-time Camunda workflow status display
- **Account Management**: Customer profile and order history

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Medusa JS SDK** - Type-safe API client
- **Stripe** - Payment processing (when configured)

## Getting Started

### Prerequisites

- Node.js 20+
- Running Medusa backend (http://localhost:9000)

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env.local` file:

```bash
# Required
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Optional - Stripe (for payment processing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Optional - Default region
NEXT_PUBLIC_DEFAULT_REGION=us
```

### Development

```bash
npm run dev
```

The storefront will be available at http://localhost:8000

### Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login/Register pages
│   │   ├── (account)/        # Customer account pages
│   │   ├── (shop)/           # Shop pages (products, cart, checkout)
│   │   ├── actions/          # Server actions
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   ├── auth/             # Auth forms
│   │   ├── layout/           # Header, Footer
│   │   ├── orders/           # Order tracking
│   │   ├── products/         # Product components
│   │   ├── providers/        # Context providers
│   │   └── ui/               # UI primitives
│   └── lib/
│       ├── auth.ts           # Auth utilities
│       ├── constants.ts      # App constants
│       ├── medusa.ts         # Medusa SDK client
│       └── utils.ts          # Helper functions
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with featured products |
| `/products` | Product catalog |
| `/products/[handle]` | Product detail page |
| `/categories` | Category listing |
| `/categories/[handle]` | Category products |
| `/cart` | Shopping cart |
| `/checkout` | Checkout flow |
| `/checkout/success` | Order confirmation |
| `/login` | Customer login |
| `/register` | Customer registration |
| `/account` | Account dashboard |
| `/account/orders` | Order history |
| `/account/orders/[id]` | Order detail with workflow tracking |
| `/account/profile` | Profile management |

## Camunda Workflow Integration

Orders display real-time workflow status tracking:

1. **Order Received** - Order placed and Camunda workflow started
2. **Payment Verified** - Payment confirmed by `verify-payment` worker
3. **Inventory Reserved** - Stock reserved by `reserve-inventory` worker
4. **Order Complete** - Customer notified by `send-notification` worker

The `OrderWorkflowTracker` component displays this progress visually on order detail pages.

## API Integration

The storefront communicates with Medusa backend via the JS SDK:

```typescript
import { medusa } from "@/lib/medusa";

// Fetch products
const { products } = await medusa.store.product.list();

// Add to cart
await medusa.store.cart.createLineItem(cartId, { variant_id, quantity });

// Complete checkout
await medusa.store.cart.complete(cartId);
```

## Styling

Uses Tailwind CSS with custom design tokens:

- **Primary**: Dark theme (#0a0a0a)
- **Accent**: Blue (#2563eb)
- **Typography**: Geist Sans/Mono fonts

## Contributing

1. Follow the existing code patterns
2. Use TypeScript strictly
3. Keep components small and focused
4. Test on both light and dark modes
