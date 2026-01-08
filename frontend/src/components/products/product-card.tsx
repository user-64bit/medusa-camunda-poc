import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Eye } from "lucide-react";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const thumbnail = product.thumbnail || product.images?.[0]?.url;
  const variant = product.variants?.[0];
  const price = variant?.calculated_price?.calculated_amount;
  const currencyCode = variant?.calculated_price?.currency_code || "USD";

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block overflow-hidden rounded-2xl bg-secondary/50 border border-border hover:border-primary/30 transition-all duration-300 card-hover"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              <Eye className="h-4 w-4" />
              View Product
            </div>
          </div>
        </div>

        {/* Variant badge */}
        {product.variants && product.variants.length > 1 && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm rounded-full text-foreground">
              {product.variants.length} options
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5">
        {product.collection && (
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            {product.collection.title}
          </span>
        )}
        
        <h3 className="font-semibold text-base mt-1 line-clamp-1 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        
        {product.subtitle && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
            {product.subtitle}
          </p>
        )}
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">
            {price !== undefined ? formatPrice(price, currencyCode) : "—"}
          </span>
          
          {/* Quick view indicator */}
          <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <ShoppingBag className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
