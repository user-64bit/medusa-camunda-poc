import Link from "next/link";
import { medusa } from "@/lib/medusa";

async function getCategories() {
  try {
    const { product_categories } = await medusa.store.category.list({
      include_descendants_tree: true,
    });
    return product_categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export const metadata = {
  title: "Categories | Medusa Store",
  description: "Browse product categories",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground mt-1">
          Browse products by category
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.handle}`}
              className="group p-6 rounded-lg border border-border bg-background hover:border-accent hover:shadow-md transition-all"
            >
              <h3 className="font-semibold group-hover:text-accent transition-colors">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">
            No categories available. Add some categories in the Medusa admin!
          </p>
        </div>
      )}
    </div>
  );
}
