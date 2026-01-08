"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, CreditCard, Check, Package, ShieldCheck, Truck } from "lucide-react";
import { medusa } from "@/lib/medusa";

type CheckoutStep = "information" | "shipping" | "payment";

const STEPS = [
  { key: "information" as const, label: "Information", icon: Package },
  { key: "shipping" as const, label: "Shipping", icon: Truck },
  { key: "payment" as const, label: "Payment", icon: CreditCard },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refreshCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>("information");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    address_2: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "gb",
    phone: "",
  });

  useEffect(() => {
    if (cart?.email) {
      setEmail(cart.email);
    }
    if (cart?.shipping_address) {
      setShippingAddress({
        first_name: cart.shipping_address.first_name || "",
        last_name: cart.shipping_address.last_name || "",
        address_1: cart.shipping_address.address_1 || "",
        address_2: cart.shipping_address.address_2 || "",
        city: cart.shipping_address.city || "",
        province: cart.shipping_address.province || "",
        postal_code: cart.shipping_address.postal_code || "",
        country_code: cart.shipping_address.country_code || "gb",
        phone: cart.shipping_address.phone || "",
      });
    }
  }, [cart]);

  const items = cart?.items || [];
  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  if (!cart || items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some products to checkout</p>
          <Link href="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleInformationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await medusa.store.cart.update(cart.id, {
        email,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
      });

      await refreshCart();
      setStep("shipping");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShippingSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { shipping_options } = await medusa.store.fulfillment.listCartOptions({
        cart_id: cart.id,
      });

      if (shipping_options && shipping_options.length > 0) {
        await medusa.store.cart.addShippingMethod(cart.id, {
          option_id: shipping_options[0].id,
        });
      }

      await refreshCart();
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add shipping");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Payment collection is created automatically when initiating payment session
      await medusa.store.payment.initiatePaymentSession(cart, {
        provider_id: "pp_system_default",
      });

      const response = await medusa.store.cart.complete(cart.id);

      if (response.type === "order" && response.order) {
        router.push(`/checkout/success?order_id=${response.order.id}`);
      } else {
        setError("Failed to complete order");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30">
        <div className="container py-4">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${i <= currentStepIndex
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                      }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${i < currentStepIndex
                      ? "bg-success text-success-foreground"
                      : i === currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                      }`}>
                      {i < currentStepIndex ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <s.icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="hidden sm:inline font-medium text-sm">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${i < currentStepIndex ? "bg-success" : "bg-muted"
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-3">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm mb-6 border border-destructive/30">
                  {error}
                </div>
              )}

              {/* Information Step */}
              {step === "information" && (
                <form onSubmit={handleInformationSubmit} className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="First name"
                          value={shippingAddress.first_name}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, first_name: e.target.value })}
                          required
                        />
                        <Input
                          placeholder="Last name"
                          value={shippingAddress.last_name}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, last_name: e.target.value })}
                          required
                        />
                      </div>
                      <Input
                        placeholder="Address"
                        value={shippingAddress.address_1}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address_1: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Apartment, suite, etc. (optional)"
                        value={shippingAddress.address_2}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address_2: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="City"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          required
                        />
                        <Input
                          placeholder="State / Province"
                          value={shippingAddress.province}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Postal code"
                          value={shippingAddress.postal_code}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                          required
                        />
                        <Input
                          placeholder="Phone (optional)"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full h-12" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Continue to Shipping"
                    )}
                  </Button>
                </form>
              )}

              {/* Shipping Step */}
              {step === "shipping" && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="text-xl font-bold mb-6">Shipping Method</h2>
                    <div className="p-4 rounded-xl border-2 border-primary bg-primary/5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Truck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Standard Shipping</p>
                          <p className="text-sm text-muted-foreground">5-7 business days</p>
                        </div>
                        <div className="ml-auto font-semibold">
                          {formatPrice(1000, cart.currency_code)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep("information")} className="flex-1 h-12">
                      Back
                    </Button>
                    <Button onClick={handleShippingSubmit} className="flex-1 h-12" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        "Continue to Payment"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment Step */}
              {step === "payment" && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="text-xl font-bold mb-6">Payment</h2>
                    <div className="p-6 rounded-xl border border-border bg-secondary/30">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                          <ShieldCheck className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold">Secure Test Payment</p>
                          <p className="text-sm text-muted-foreground">
                            Payment will be processed in test mode
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep("shipping")} className="flex-1 h-12">
                      Back
                    </Button>
                    <Button onClick={handlePaymentSubmit} className="flex-1 h-12" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        `Pay ${formatPrice(cart.total, cart.currency_code)}`
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 p-6 rounded-2xl border border-border bg-secondary/30">
                <h2 className="text-lg font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        {item.variant?.title && item.variant.title !== "Default" && (
                          <p className="text-xs text-muted-foreground">{item.variant.title}</p>
                        )}
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(item.unit_price * item.quantity, cart.currency_code)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(cart.subtotal, cart.currency_code)}</span>
                  </div>
                  {cart.discount_total > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-success font-medium">
                        -{formatPrice(cart.discount_total, cart.currency_code)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {cart.shipping_total
                        ? formatPrice(cart.shipping_total, cart.currency_code)
                        : "Calculated next"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatPrice(cart.tax_total || 0, cart.currency_code)}</span>
                  </div>
                </div>

                <div className="border-t border-border mt-4 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(cart.total, cart.currency_code)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
