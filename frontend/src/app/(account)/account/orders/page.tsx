import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomer, getAuthToken } from "@/lib/auth";
import { medusa } from "@/lib/medusa";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Eye } from "lucide-react";

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

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account">
            <Button variant="ghost" size="icon">
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

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-lg border border-border bg-background"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Order #{order.display_id}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(order.total, order.currency_code)}
                      </p>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        order.status === "completed" 
                          ? "bg-green-100 text-green-800" 
                          : order.status === "canceled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <Link href={`/account/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {order.items?.length || 0} item(s)
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Link href="/products">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
