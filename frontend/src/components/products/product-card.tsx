import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { HttpTypes } from "@medusajs/types";

interface ProductCardProps {
  product: HttpTypes.StoreProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const thumbnail = product.thumbnail || product.images?.[0]?.url;
  const variant = product.variants?.[0];
  const price = variant?.calculated_price?.calculated_amount;
  const currencyCode = variant?.calculated_price?.currency_code || "USD";

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block overflow-hidden rounded-lg border border-border bg-background transition-all hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl text-muted-foreground/30">📦</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-accent transition-colors">
          {product.title}
        </h3>
        {product.subtitle && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
            {product.subtitle}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold">
            {price !== undefined ? formatPrice(price, currencyCode) : "Price not available"}
          </span>
          {product.variants && product.variants.length > 1 && (
            <span className="text-xs text-muted-foreground">
              {product.variants.length} options
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
