import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight, Zap, ShieldCheck, Truck } from "lucide-react";

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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-success/5 via-background to-background" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-success/10 rounded-full blur-3xl" />
      
      <div className="relative w-full max-w-lg text-center">
        {/* Success Icon */}
        <div className="relative mx-auto h-24 w-24 mb-8">
          <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
          <div className="relative h-24 w-24 rounded-full bg-success flex items-center justify-center shadow-lg shadow-success/30">
            <CheckCircle className="h-12 w-12 text-success-foreground" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          Thank you for your purchase. Your order is now being processed by our workflow system.
        </p>

        {order_id && (
          <div className="p-4 rounded-xl bg-secondary/50 border border-border mb-8 inline-block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order ID</p>
            <p className="font-mono text-sm font-medium">{order_id}</p>
          </div>
        )}

        {/* Workflow Preview */}
        <div className="p-6 rounded-2xl border border-border bg-secondary/30 mb-8">
          <div className="flex items-center gap-4 text-left mb-6">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Package className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-semibold">Real-Time Tracking</p>
              <p className="text-sm text-muted-foreground">
                Track your order through our Camunda-powered workflow
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { step: 1, icon: Package, label: "Received", active: true },
              { step: 2, icon: ShieldCheck, label: "Payment", active: false },
              { step: 3, icon: Truck, label: "Reserved", active: false },
              { step: 4, icon: Zap, label: "Complete", active: false },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`h-10 w-10 mx-auto rounded-lg flex items-center justify-center mb-2 ${
                  item.active 
                    ? "bg-accent text-accent-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {order_id && (
            <Link href={`/account/orders/${order_id}`}>
              <Button size="lg" className="w-full sm:w-auto">
                Track Order
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
          <Link href="/products">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
