export const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

export const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";

export const CART_COOKIE_NAME = "medusa_cart_id";
export const AUTH_COOKIE_NAME = "medusa_auth_token";

export const WORKFLOW_STATUS_LABELS: Record<string, string> = {
  started: "Order Received",
  payment_verified: "Payment Confirmed",
  inventory_reserved: "Items Reserved",
  completed: "Order Complete",
};

export const WORKFLOW_STATUS_ORDER = [
  "started",
  "payment_verified", 
  "inventory_reserved",
  "completed",
];
