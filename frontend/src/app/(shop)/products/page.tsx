import { medusa } from "@/lib/medusa";
import { ProductCard } from "@/components/products/product-card";
import { Package, Filter, Grid3X3 } from "lucide-react";

async function getProducts() {
  try {
    const { products } = await medusa.store.product.list({
      limit: 100,
    });
    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export const metadata = {
  title: "Products | Medusa Store",
  description: "Browse our complete product collection",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-secondary/30 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="container relative py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              All Products
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Explore our complete collection of high-quality products, all backed by 
              real-time order tracking.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{products.length}</span> products
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted/50 transition-colors">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted/50 transition-colors">
              <Grid3X3 className="h-4 w-4" />
              View
            </button>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl bg-secondary/30 border border-dashed border-border">
            <div className="h-20 w-20 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No products available</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Add some products in the Medusa admin to see them here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
