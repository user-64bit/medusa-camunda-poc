"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { medusa } from "@/lib/medusa";
import { HttpTypes } from "@medusajs/types";

type Cart = HttpTypes.StoreCart;

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_KEY = "medusa_cart_id";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getOrCreateCart = useCallback(async (): Promise<Cart> => {
    const storedCartId = localStorage.getItem(CART_ID_KEY);

    if (storedCartId) {
      try {
        const { cart: existingCart } = await medusa.store.cart.retrieve(storedCartId);
        if (existingCart && existingCart.completed_at === null) {
          return existingCart;
        }
      } catch {
        // Cart not found or invalid, create new one
        localStorage.removeItem(CART_ID_KEY);
      }
    }

    // Create new cart
    const { cart: newCart } = await medusa.store.cart.create({});
    localStorage.setItem(CART_ID_KEY, newCart.id);
    return newCart;
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const freshCart = await getOrCreateCart();
      setCart(freshCart);
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getOrCreateCart]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (variantId: string, quantity: number = 1) => {
    if (!cart) return;

    try {
      const { cart: updatedCart } = await medusa.store.cart.createLineItem(
        cart.id,
        {
          variant_id: variantId,
          quantity,
        }
      );
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to add item:", error);
      throw error;
    }
  };

  const updateItem = async (lineItemId: string, quantity: number) => {
    if (!cart) return;

    try {
      const { cart: updatedCart } = await medusa.store.cart.updateLineItem(
        cart.id,
        lineItemId,
        { quantity }
      );
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to update item:", error);
      throw error;
    }
  };

  const removeItem = async (lineItemId: string) => {
    if (!cart) return;

    try {
      const { parent: updatedCart } = await medusa.store.cart.deleteLineItem(
        cart.id,
        lineItemId
      );
      setCart(updatedCart as Cart);
    } catch (error) {
      console.error("Failed to remove item:", error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addItem,
        updateItem,
        removeItem,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
