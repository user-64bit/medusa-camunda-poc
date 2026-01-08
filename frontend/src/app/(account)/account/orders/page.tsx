import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomer, getAuthToken } from "@/lib/auth";
import { medusa } from "@/lib/medusa";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Eye, ShoppingBag, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Order History | Medusa Store",
  description: "View your order history",
};

async function getOrders() {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const { orders } = await medusa.store.order.list(
      {},
      { Authorization: `Bearer ${token}` }
    );
    return orders;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export default async function OrdersPage() {
  const customer = await getCustomer();

  if (!customer) {
    redirect("/login");
  }

  const orders = await getOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success border-success/30";
      case "canceled":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-primary/10 text-primary border-primary/30";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-secondary/30 border-b border-border">
        <div className="container py-8">
          <div className="flex items-center gap-4">
            <Link href="/account">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Order History</h1>
              <p className="text-muted-foreground mt-1">
                View and track your orders
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={order.id}
                className="p-6 rounded-2xl border border-border bg-secondary/30 hover:border-primary/30 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">Order #{order.display_id}</p>
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-bold text-lg">
                        {formatPrice(order.total, order.currency_code)}
                      </p>
                    </div>
                    
                    <Link href={`/account/orders/${order.id}`}>
                      <Button variant="outline" className="group">
                        View Details
                        <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">
                    {order.items?.map(item => item.title).slice(0, 2).join(", ")}
                    {(order.items?.length || 0) > 2 && ` +${order.items!.length - 2} more`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl bg-secondary/30 border border-dashed border-border">
            <div className="h-20 w-20 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You haven&apos;t placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link href="/products">
              <Button size="lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
