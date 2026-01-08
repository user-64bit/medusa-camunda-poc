"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/cart-provider";
import { Spinner } from "@/components/ui/spinner";

interface AddToCartButtonProps {
  variantId: string;
}

export function AddToCartButton({ variantId }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await addItem(variantId, 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading}
      size="lg"
      className="w-full"
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          Adding...
        </>
      ) : isAdded ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
