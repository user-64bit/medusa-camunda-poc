# Admin Customizations

This directory contains admin dashboard customizations including widgets and internationalization.

## Widgets

### Workflow Status Widget (`widgets/workflow-status.tsx`)

Displays Camunda workflow status on the order detail page in the admin dashboard.

**Zone:** `order.details.side.after`

**Features:**
- Visual progress stepper showing workflow stages
- Real-time status badge with color coding
- Auto-refresh while workflow is in progress
- Workflow instance ID display
- Error message display if workflow fails
- Link to Camunda Operate console

**Workflow Stages:**
1. 📥 Order Received
2. 💳 Payment Verified
3. 📦 Inventory Reserved
4. ✅ Completed

**Status Colors:**
- Grey: Pending
- Orange: Started
- Blue: In Progress (payment_verified, inventory_reserved)
- Green: Completed

## Structure

```
src/admin/
├── widgets/
│   └── workflow-status.tsx  # Order workflow progress widget
├── i18n/
│   ├── index.ts             # Translation exports
│   └── README.md            # i18n documentation
├── tsconfig.json            # Admin TypeScript config
├── vite-env.d.ts           # Vite type definitions
└── README.md               # This file
```

## Adding New Widgets

Create a new `.tsx` file in the `widgets/` directory:

```tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading } from "@medusajs/ui";

const MyWidget = ({ data }) => {
  return (
    <Container>
      <Heading level="h2">My Widget</Heading>
      {/* Widget content */}
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.side.after", // or other zones
});

export default MyWidget;
```

**Available Zones:**
- `order.details.before` / `order.details.after`
- `order.details.side.before` / `order.details.side.after`
- `product.details.before` / `product.details.after`
- See [Medusa Admin documentation](https://docs.medusajs.com/learn/fundamentals/admin/widgets) for full list

## Internationalization

The `i18n/` directory contains translation files. Currently no custom translations are configured.

To add translations:
1. Create JSON files in `i18n/json/` (e.g., `en.json`)
2. Export in `i18n/index.ts`
3. Use `useTranslation()` hook in widgets

For more information, see the [Medusa Admin documentation](https://docs.medusajs.com/learn/fundamentals/admin).
