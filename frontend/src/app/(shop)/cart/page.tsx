"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (lineItemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setUpdatingItems((prev) => new Set(prev).add(lineItemId));
    try {
      await updateItem(lineItemId, quantity);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(lineItemId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (lineItemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(lineItemId));
    try {
      await removeItem(lineItemId);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(lineItemId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-16 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Shopping Cart</h1>

      {isEmpty ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Link href="/products">
            <Button>
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const isUpdating = updatingItems.has(item.id);
              
              return (
                <div
                  key={item.id}
                  className={`flex gap-4 p-4 rounded-lg border border-border bg-background transition-opacity ${
                    isUpdating ? "opacity-50" : ""
                  }`}
                >
                  {/* Item Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-3xl">📦</span>
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product_handle}`}
                      className="font-medium hover:text-accent transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    {item.variant?.title && item.variant.title !== "Default" && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {item.variant.title}
                      </p>
                    )}
                    <p className="text-sm font-medium mt-1">
                      {formatPrice(item.unit_price, cart?.currency_code)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={isUpdating || item.quantity <= 1}
                        className="h-8 w-8 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={isUpdating}
                        className="h-8 w-8 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isUpdating}
                      className="h-8 w-8 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <p className="font-semibold">
                      {formatPrice(
                        item.unit_price * item.quantity,
                        cart?.currency_code
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-lg border border-border bg-background">
              <h2 className="font-semibold mb-4">Order Summary</h2>

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatPrice(cart?.subtotal, cart?.currency_code)}</dd>
                </div>
                {cart?.discount_total !== undefined && cart.discount_total > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Discount</dt>
                    <dd className="text-green-600">
                      -{formatPrice(cart.discount_total, cart.currency_code)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="text-muted-foreground">
                    Calculated at checkout
                  </dd>
                </div>
              </dl>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between font-semibold">
                  <span>Estimated Total</span>
                  <span>{formatPrice(cart?.total, cart?.currency_code)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block mt-6">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link
                href="/products"
                className="block text-center text-sm text-muted-foreground hover:text-foreground mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
