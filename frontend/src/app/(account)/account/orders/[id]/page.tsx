import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCustomer, getAuthToken } from "@/lib/auth";
import { medusa } from "@/lib/medusa";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, MapPin } from "lucide-react";
import { OrderWorkflowTracker } from "@/components/orders/order-workflow-tracker";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getOrder(orderId: string) {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const { order } = await medusa.store.order.retrieve(
      orderId,
      {},
      { Authorization: `Bearer ${token}` }
    );
    return order;
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrder(id);
  
  if (!order) {
    return { title: "Order Not Found" };
  }

  return {
    title: `Order #${order.display_id} | Medusa Store`,
    description: `Order details for #${order.display_id}`,
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const customer = await getCustomer();

  if (!customer) {
    redirect("/login");
  }

  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-secondary/30 border-b border-border">
        <div className="container py-8">
          <div className="flex items-center gap-4">
            <Link href="/account/orders">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  Order #{order.display_id}
                </h1>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                  order.status === "completed" 
                    ? "bg-success/10 text-success border-success/30" 
                    : order.status === "canceled"
                    ? "bg-destructive/10 text-destructive border-destructive/30"
                    : "bg-primary/10 text-primary border-primary/30"
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Workflow Tracker */}
            <OrderWorkflowTracker order={order} />

            {/* Order Items */}
            <div className="p-6 rounded-2xl border border-border bg-secondary/30">
              <h2 className="font-semibold text-lg mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-4 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted flex-shrink-0">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.title}</p>
                      {item.variant?.title && item.variant.title !== "Default" && (
                        <p className="text-sm text-muted-foreground">
                          {item.variant.title}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {formatPrice(item.unit_price * item.quantity, order.currency_code)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.unit_price, order.currency_code)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="p-6 rounded-2xl border border-border bg-secondary/30">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">{formatPrice(order.subtotal, order.currency_code)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-medium">{formatPrice(order.shipping_total, order.currency_code)}</dd>
                </div>
                {order.discount_total > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Discount</dt>
                    <dd className="text-success font-medium">
                      -{formatPrice(order.discount_total, order.currency_code)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tax</dt>
                  <dd className="font-medium">{formatPrice(order.tax_total, order.currency_code)}</dd>
                </div>
                <div className="flex justify-between pt-3 border-t border-border text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-bold">{formatPrice(order.total, order.currency_code)}</dd>
                </div>
              </dl>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="p-6 rounded-2xl border border-border bg-secondary/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h2 className="font-semibold">Shipping Address</h2>
                </div>
                <address className="not-italic text-sm text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}
                  </span>
                  <br />
                  {order.shipping_address.address_1}
                  {order.shipping_address.address_2 && (
                    <>
                      <br />
                      {order.shipping_address.address_2}
                    </>
                  )}
                  <br />
                  {order.shipping_address.city}, {order.shipping_address.province}{" "}
                  {order.shipping_address.postal_code}
                  <br />
                  {order.shipping_address.country_code?.toUpperCase()}
                </address>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
