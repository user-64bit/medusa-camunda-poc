import { notFound } from "next/navigation";
import { medusa } from "@/lib/medusa";
import { ProductCard } from "@/components/products/product-card";

interface CategoryPageProps {
  params: Promise<{ handle: string }>;
}

async function getCategoryWithProducts(handle: string) {
  try {
    const { product_categories } = await medusa.store.category.list({
      handle,
      limit: 1,
    });
    
    const category = product_categories[0];
    if (!category) return null;

    const { products } = await medusa.store.product.list({
      category_id: [category.id],
      limit: 100,
    });

    return { category, products };
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { handle } = await params;
  const data = await getCategoryWithProducts(handle);
  
  if (!data) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${data.category.name} | Medusa Store`,
    description: data.category.description || `Shop ${data.category.name}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { handle } = await params;
  const data = await getCategoryWithProducts(handle);

  if (!data) {
    notFound();
  }

  const { category, products } = data;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-1">{category.description}</p>
        )}
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
            No products in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}
