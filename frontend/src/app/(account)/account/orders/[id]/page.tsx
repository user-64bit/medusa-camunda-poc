import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCustomer, getAuthToken } from "@/lib/auth";
import { medusa } from "@/lib/medusa";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Order #{order.display_id}
            </h1>
            <p className="text-muted-foreground mt-1">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        {/* Order Workflow Tracker */}
        <OrderWorkflowTracker order={order} />

        {/* Order Items */}
        <div className="mt-8 p-6 rounded-lg border border-border bg-background">
          <h2 className="font-semibold mb-4">Items</h2>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted flex-shrink-0">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.title}</p>
                  {item.variant?.title && item.variant.title !== "Default" && (
                    <p className="text-sm text-muted-foreground">
                      {item.variant.title}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatPrice(item.unit_price * item.quantity, order.currency_code)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-4 p-6 rounded-lg border border-border bg-background">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(order.subtotal, order.currency_code)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{formatPrice(order.shipping_total, order.currency_code)}</dd>
            </div>
            {order.discount_total > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="text-green-600">
                  -{formatPrice(order.discount_total, order.currency_code)}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd>{formatPrice(order.tax_total, order.currency_code)}</dd>
            </div>
            <div className="flex justify-between pt-2 border-t border-border font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(order.total, order.currency_code)}</dd>
            </div>
          </dl>
        </div>

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="mt-4 p-6 rounded-lg border border-border bg-background">
            <h2 className="font-semibold mb-4">Shipping Address</h2>
            <address className="not-italic text-sm text-muted-foreground">
              {order.shipping_address.first_name} {order.shipping_address.last_name}
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
  );
}
