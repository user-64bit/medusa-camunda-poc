import { notFound } from "next/navigation";
import Image from "next/image";
import { medusa } from "@/lib/medusa";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductGallery } from "@/components/products/product-gallery";

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
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Gallery */}
        <ProductGallery images={images} title={product.title} />

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-4">
            {product.collection && (
              <p className="text-sm text-muted-foreground mb-1">
                {product.collection.title}
              </p>
            )}
            <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
            {product.subtitle && (
              <p className="text-muted-foreground mt-1">{product.subtitle}</p>
            )}
          </div>

          <div className="text-2xl font-semibold mb-6">
            {price !== undefined ? formatPrice(price, currencyCode) : "Price not available"}
          </div>

          {product.description && (
            <div className="prose prose-sm max-w-none mb-6">
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          {/* Variant Selection (simplified - shows first variant) */}
          {product.variants && product.variants.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <span
                    key={v.id}
                    className="px-3 py-1 text-sm border border-border rounded-md"
                  >
                    {v.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          {variant && (
            <AddToCartButton variantId={variant.id} />
          )}

          {/* Product Details */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-sm font-semibold mb-4">Product Details</h3>
            <dl className="space-y-3 text-sm">
              {product.material && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Material</dt>
                  <dd>{product.material}</dd>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Weight</dt>
                  <dd>{product.weight}g</dd>
                </div>
              )}
              {product.origin_country && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Origin</dt>
                  <dd>{product.origin_country}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
