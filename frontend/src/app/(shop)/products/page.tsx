import { medusa } from "@/lib/medusa";
import { ProductCard } from "@/components/products/product-card";

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
  description: "Browse our product catalog",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
        <p className="text-muted-foreground mt-1">
          Browse our complete collection
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">
            No products available. Add some products in the Medusa admin!
          </p>
        </div>
      )}
    </div>
  );
}
