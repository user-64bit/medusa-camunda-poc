"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Package } from "lucide-react";
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
      <div className="container py-20 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading your cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/products">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {isEmpty ? "Your cart is empty" : `${items.length} item${items.length > 1 ? "s" : ""} in your cart`}
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className="text-center py-20 rounded-2xl bg-secondary/30 border border-dashed border-border">
          <div className="h-20 w-20 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Looks like you haven&apos;t added anything yet. Start exploring our products!
          </p>
          <Link href="/products">
            <Button size="lg">
              Browse Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => {
              const isUpdating = updatingItems.has(item.id);
              
              return (
                <div
                  key={item.id}
                  className={`flex gap-4 p-5 rounded-2xl border border-border bg-secondary/30 transition-all duration-300 animate-fade-in ${
                    isUpdating ? "opacity-50" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Item Image */}
                  <Link href={`/products/${item.product_handle}`} className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-muted group">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </Link>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product_handle}`}
                      className="font-semibold hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    {item.variant?.title && item.variant.title !== "Default" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.variant.title}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-primary mt-2">
                      {formatPrice(item.unit_price, cart?.currency_code)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isUpdating || item.quantity <= 1}
                          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-background disabled:opacity-50 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatPrice(item.unit_price * item.quantity, cart?.currency_code)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-2xl border border-border bg-secondary/30">
              <h2 className="font-semibold text-lg mb-6">Order Summary</h2>

              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-semibold">{formatPrice(cart?.subtotal, cart?.currency_code)}</dd>
                </div>
                {cart?.discount_total !== undefined && cart.discount_total > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Discount</dt>
                    <dd className="text-success font-semibold">
                      -{formatPrice(cart.discount_total, cart.currency_code)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="text-muted-foreground text-sm">
                    Calculated at checkout
                  </dd>
                </div>
              </dl>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(cart?.total, cart?.currency_code)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Including taxes
                </p>
              </div>

              <Link href="/checkout" className="block mt-6">
                <Button className="w-full h-12 text-base font-semibold">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link
                href="/products"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
