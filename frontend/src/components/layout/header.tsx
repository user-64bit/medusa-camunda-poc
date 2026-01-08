"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart } = useCart();
  
  const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">M</span>
            </div>
            <span className="hidden font-semibold sm:inline-block">
              Medusa Store
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/products"
              className="transition-colors hover:text-accent"
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="transition-colors hover:text-accent"
            >
              Categories
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            
            <Link
              href="/account"
              className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>

            <Link
              href="/cart"
              className="relative h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-[10px] font-medium text-accent-foreground flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/products"
                className="px-2 py-1 text-sm font-medium transition-colors hover:text-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="px-2 py-1 text-sm font-medium transition-colors hover:text-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
