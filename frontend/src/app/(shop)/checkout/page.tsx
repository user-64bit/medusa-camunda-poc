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
import { ArrowLeft, CreditCard, Check } from "lucide-react";
import { medusa } from "@/lib/medusa";

type CheckoutStep = "information" | "shipping" | "payment";

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
    country_code: "us",
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
        country_code: cart.shipping_address.country_code || "us",
        phone: cart.shipping_address.phone || "",
      });
    }
  }, [cart]);

  const items = cart?.items || [];

  if (!cart || items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const handleInformationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Update cart with email and shipping address
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
      // Get available shipping options
      const { shipping_options } = await medusa.store.fulfillment.listCartOptions({
        cart_id: cart.id,
      });

      if (shipping_options && shipping_options.length > 0) {
        // Add shipping method (use first available option)
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
      // Initialize payment sessions
      await medusa.store.cart.createPaymentCollection(cart.id);
      
      // Get payment sessions
      const { payment_collection } = await medusa.store.payment.initiatePaymentSession(cart.id, {
        provider_id: "pp_system_default", // or use Stripe when configured
      });

      // Complete cart
      const { type, cart: completedCart, order } = await medusa.store.cart.complete(cart.id);

      if (type === "order" && order) {
        router.push(`/checkout/success?order_id=${order.id}`);
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
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/cart"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div>
            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-8">
              {["information", "shipping", "payment"].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                      step === s
                        ? "bg-primary text-primary-foreground"
                        : ["information", "shipping", "payment"].indexOf(step) > i
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {["information", "shipping", "payment"].indexOf(step) > i ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < 2 && (
                    <div
                      className={`w-12 h-0.5 ${
                        ["information", "shipping", "payment"].indexOf(step) > i
                          ? "bg-green-500"
                          : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md mb-4">
                {error}
              </div>
            )}

            {/* Information Step */}
            {step === "information" && (
              <form onSubmit={handleInformationSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Contact Information
                  </h2>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="First name"
                        value={shippingAddress.first_name}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            first_name: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        placeholder="Last name"
                        value={shippingAddress.last_name}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            last_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <Input
                      placeholder="Address"
                      value={shippingAddress.address_1}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          address_1: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      placeholder="Apartment, suite, etc. (optional)"
                      value={shippingAddress.address_2}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          address_2: e.target.value,
                        })
                      }
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="City"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            city: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        placeholder="State / Province"
                        value={shippingAddress.province}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            province: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Postal code"
                        value={shippingAddress.postal_code}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            postal_code: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        placeholder="Phone (optional)"
                        value={shippingAddress.phone}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
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
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
                  <div className="p-4 rounded-lg border border-border bg-background">
                    <p className="font-medium">Standard Shipping</p>
                    <p className="text-sm text-muted-foreground">
                      5-7 business days
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep("information")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleShippingSubmit}
                    className="flex-1"
                    disabled={isLoading}
                  >
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
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Payment</h2>
                  <div className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Test Payment</p>
                        <p className="text-sm text-muted-foreground">
                          Payment will be processed in test mode
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: Stripe integration requires configuration. Currently using test payment.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep("shipping")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePaymentSubmit}
                    className="flex-1"
                    disabled={isLoading}
                  >
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
          <div className="lg:pl-8 lg:border-l border-border">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
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
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.variant?.title && item.variant.title !== "Default" && (
                      <p className="text-xs text-muted-foreground">
                        {item.variant.title}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.unit_price * item.quantity, cart.currency_code)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cart.subtotal, cart.currency_code)}</span>
              </div>
              {cart.discount_total > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">
                    -{formatPrice(cart.discount_total, cart.currency_code)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {cart.shipping_total
                    ? formatPrice(cart.shipping_total, cart.currency_code)
                    : "Calculated next"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(cart.tax_total || 0, cart.currency_code)}</span>
              </div>
            </div>

            <div className="border-t border-border mt-4 pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(cart.total, cart.currency_code)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
