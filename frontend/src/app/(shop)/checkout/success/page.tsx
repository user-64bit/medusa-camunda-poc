import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

interface SuccessPageProps {
  searchParams: Promise<{ order_id?: string }>;
}

export const metadata = {
  title: "Order Confirmed | Medusa Store",
  description: "Your order has been placed successfully",
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { order_id } = await searchParams;

  return (
    <div className="container py-16">
      <div className="max-w-lg mx-auto text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your purchase. Your order has been placed successfully
          and is now being processed.
        </p>

        {order_id && (
          <div className="p-4 rounded-lg bg-muted mb-8">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-mono text-sm">{order_id}</p>
          </div>
        )}

        <div className="p-6 rounded-lg border border-border bg-background mb-8">
          <div className="flex items-center gap-4 text-left">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Package className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-medium">Track Your Order</p>
              <p className="text-sm text-muted-foreground">
                You can track your order status in real-time through your account.
                Our Camunda workflow will process your order through payment
                verification, inventory reservation, and shipping.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {order_id && (
            <Link href={`/account/orders/${order_id}`}>
              <Button>
                View Order
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link href="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="font-semibold mb-4">What happens next?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm mb-2">
                1
              </div>
              <p className="font-medium text-sm">Payment Verified</p>
              <p className="text-xs text-muted-foreground">
                Your payment is being verified
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm mb-2">
                2
              </div>
              <p className="font-medium text-sm">Items Reserved</p>
              <p className="text-xs text-muted-foreground">
                Inventory is reserved for you
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm mb-2">
                3
              </div>
              <p className="font-medium text-sm">Order Complete</p>
              <p className="text-xs text-muted-foreground">
                You&apos;ll receive a confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
