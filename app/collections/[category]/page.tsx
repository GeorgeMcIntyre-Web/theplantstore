import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getPrismaClient } from "@/lib/db";

interface CategoryPageProps {
  params: {
    category: string;
  };
  searchParams: {
    page?: string;
    careLevel?: string;
    lightRequirement?: string;
    isPetSafe?: string;
    plantSize?: string;
    sortBy?: string;
    sortOrder?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

async function getCategory(slug: string) {
  try {
    const prisma = getPrismaClient();
    const category = await prisma.category.findFirst({
      where: {
        slug: slug,
        isActive: true,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return category;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = await getCategory(params.category);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} - The House Plant Store`,
    description:
      category.description ||
      `Shop ${category.name.toLowerCase()} at The House Plant Store. Premium plants delivered across South Africa.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const category = await getCategory(params.category);

  if (!category) {
    notFound();
  }

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/collections" },
    { name: category.name, href: `/collections/${category.slug}` },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-muted-foreground max-w-3xl">
                {category.description}
              </p>
            )}
          </div>

          {/* Filters and Products */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <ProductFilters category={category.slug} />
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <ProductGrid
                category={category.slug}
                searchParams={searchParams}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
