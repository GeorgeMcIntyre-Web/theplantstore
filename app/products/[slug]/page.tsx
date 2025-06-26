
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductDetails } from '@/components/products/product-details'
import { ProductImages } from '@/components/products/product-images'
import { ProductTabs } from '@/components/products/product-tabs'
import { RelatedProducts } from '@/components/products/related-products'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { prisma } from '@/lib/db'

interface ProductPageProps {
  params: {
    slug: string
  }
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: {
      slug: slug,
      isActive: true,
    },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: 'asc' }
      },
      reviews: {
        where: { isApproved: true },
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!product) return null

  // Get related products
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1
      }
    },
    take: 4
  })

  // Calculate average rating
  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / product.reviews.length
    : 0

  return {
    ...product,
    averageRating,
    reviewCount: product.reviews.length,
    relatedProducts
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} - The House Plant Store`,
    description: product.metaDescription || product.shortDescription || product.description || `Buy ${product.name} online at The House Plant Store. Premium plants delivered across South Africa.`,
    keywords: `${product.name}, ${product.category.name}, plants, South Africa, plant delivery`,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description || '',
      images: product.images.length > 0 ? [product.images[0].url] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/collections' },
    { name: product.category.name, href: `/collections/${product.category.slug}` },
    { name: product.name, href: `/products/${product.slug}` },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          {/* Product Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <ProductImages images={product.images} productName={product.name} />

            {/* Product Details */}
            <ProductDetails product={product as any} />
          </div>

          {/* Product Tabs */}
          <ProductTabs product={product as any} />

          {/* Related Products */}
          {product.relatedProducts.length > 0 && (
            <RelatedProducts products={product.relatedProducts as any} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
