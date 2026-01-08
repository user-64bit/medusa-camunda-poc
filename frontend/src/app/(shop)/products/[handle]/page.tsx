import { notFound } from "next/navigation";
import Link from "next/link";
import { medusa } from "@/lib/medusa";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductGallery } from "@/components/products/product-gallery";
import { ArrowLeft, Truck, ShieldCheck, RotateCcw } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

async function getProduct(handle: string) {
  try {
    const { products } = await medusa.store.product.list({
      handle,
      limit: 1,
    });
    return products[0] || null;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProduct(handle);
  
  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.title} | Medusa Store`,
    description: product.description || `Shop ${product.title}`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  const images = product.images || [];
  const variant = product.variants?.[0];
  const price = variant?.calculated_price?.calculated_amount;
  const currencyCode = variant?.calculated_price?.currency_code || "USD";

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary/30">
        <div className="container py-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <div className="animate-fade-in">
            <ProductGallery images={images} title={product.title} />
          </div>

          {/* Product Info */}
          <div className="flex flex-col animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {/* Category */}
            {product.collection && (
              <span className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
                {product.collection.title}
              </span>
            )}
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.title}</h1>
            
            {product.subtitle && (
              <p className="text-muted-foreground text-lg mt-2">{product.subtitle}</p>
            )}

            {/* Price */}
            <div className="mt-6">
              <span className="text-3xl font-bold">
                {price !== undefined ? formatPrice(price, currencyCode) : "Price not available"}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6 text-muted-foreground leading-relaxed">
                <p>{product.description}</p>
              </div>
            )}

            {/* Variant Selection */}
            {product.variants && product.variants.length > 1 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Available Options
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <span
                      key={v.id}
                      className="px-4 py-2 text-sm border-2 border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      {v.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            {variant && (
              <div className="mt-8">
                <AddToCartButton variantId={variant.id} />
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-8 pt-8 border-t border-border">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Truck, label: "Free Shipping", desc: "On orders over €50" },
                  { icon: ShieldCheck, label: "Secure Payment", desc: "100% protected" },
                  { icon: RotateCcw, label: "Easy Returns", desc: "30 day returns" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="h-10 w-10 mx-auto rounded-lg bg-muted flex items-center justify-center mb-2">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            {(product.material || product.weight || product.origin_country) && (
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Product Details
                </h3>
                <dl className="space-y-3">
                  {product.material && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Material</dt>
                      <dd className="font-medium">{product.material}</dd>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Weight</dt>
                      <dd className="font-medium">{product.weight}g</dd>
                    </div>
                  )}
                  {product.origin_country && (
                    <div className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">Origin</dt>
                      <dd className="font-medium">{product.origin_country}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
