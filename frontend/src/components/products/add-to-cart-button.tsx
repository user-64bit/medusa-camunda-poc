"use client";

import { useState } from "react";
import { ShoppingCart, Check, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/cart-provider";
import { Spinner } from "@/components/ui/spinner";

interface AddToCartButtonProps {
  variantId: string;
}

export function AddToCartButton({ variantId }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await addItem(variantId, quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2500);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">Quantity</span>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-background transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isLoading}
        size="lg"
        className={`w-full h-14 text-base font-semibold transition-all duration-300 ${
          isAdded 
            ? "bg-success hover:bg-success shadow-success/30" 
            : ""
        }`}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Adding...
          </>
        ) : isAdded ? (
          <>
            <Check className="mr-2 h-5 w-5" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </>
        )}
      </Button>

      {/* Success message */}
      {isAdded && (
        <div className="flex items-center justify-center gap-2 text-sm text-success animate-fade-in">
          <Check className="h-4 w-4" />
          <span>Item added successfully</span>
        </div>
      )}
    </div>
  );
}
