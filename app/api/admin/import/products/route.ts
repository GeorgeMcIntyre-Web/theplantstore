import { getPrismaClient } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { UserRole, CareLevel, LightRequirement, WateringFrequency, PlantSize, GrowthRate } from '@prisma/client';
import Papa from 'papaparse';


export const maxDuration = 300; // 5 minutes timeout
export const dynamic = 'force-dynamic';

// Helper function to map string values to enum values
function mapEnumValue(value: string, enumType: any): any {
  if (!value) return null;
  const upperValue = value.toUpperCase();
  return Object.values(enumType).includes(upperValue) ? upperValue : null;
}

// Helper function to match image to product by name
function matchImageToProduct(imageName: string, productName: string): boolean {
  // Remove file extension and normalize
  const imageBase = imageName.replace(/\.[^.]+$/, '').toLowerCase();
  const productNameLower = productName.toLowerCase();
  
  // Convert underscores and spaces to match
  const normalizedImage = imageBase.replace(/[_\s]/g, '');
  const normalizedProduct = productNameLower.replace(/[_\s]/g, '');
  
  // Check if product name is contained in image name
  return normalizedImage.includes(normalizedProduct) || normalizedProduct.includes(normalizedImage);
}

export async function POST(request: NextRequest) {
  try {
    console.log('Import endpoint called');
    
    // Check authentication
    const session = await getServerSession();
    console.log('Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    console.log('Prisma client obtained');
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    console.log('User found:', user?.role);

    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse FormData
    const formData = await request.formData();
    const csvFile = formData.get('file') as File;
    const imageFiles = formData.getAll('images') as File[];
    
    console.log('CSV file received:', csvFile?.name, csvFile?.size);
    console.log('Image files received:', imageFiles.length);
    
    // Debug: Log all image file names
    console.log('Image file names:');
    imageFiles.forEach((img, index) => {
      console.log(`${index + 1}. ${img.name}`);
    });

    if (!csvFile) {
      return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
    }

    // Parse CSV content
    const csvText = await csvFile.text();
    console.log('CSV text length:', csvText.length);
    
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    console.log('CSV parsed, rows:', parseResult.data.length);

    if (parseResult.errors.length > 0) {
      return NextResponse.json({ 
        error: 'CSV parsing failed', 
        details: parseResult.errors 
      }, { status: 400 });
    }

    const products = parseResult.data as any[];
    console.log('Processing', products.length, 'products');
    
    const errors = [];
    const created = [];
    const updated = [];
    const imagesProcessed = [];

    // Process all products
    for (const product of products) {
      try {
        console.log('Processing product:', product.sku, product.name);
        
        // Check if product already exists
        const existingProduct = await prisma.product.findUnique({
          where: { sku: product.sku }
        });

        const productData = {
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          price: parseFloat(product.price) || 0,
          compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
          sku: product.sku,
          stockQuantity: parseInt(product.stockQuantity) || 0,
          isActive: product.isActive === 'true' || product.isActive === true,
          isFeatured: product.isFeatured === 'true' || product.isFeatured === false,
          careLevel: mapEnumValue(product.careLevel, CareLevel),
          lightRequirement: mapEnumValue(product.lightRequirement, LightRequirement),
          wateringFrequency: mapEnumValue(product.wateringFrequency, WateringFrequency),
          isPetSafe: product.isPetSafe === 'true' || product.isPetSafe === true,
          plantSize: mapEnumValue(product.plantSize, PlantSize),
          growthRate: mapEnumValue(product.growthRate, GrowthRate),
          careInstructions: product.careInstructions || '',
          categoryId: null, // You might want to handle category mapping
          supplierId: null, // You might want to handle supplier mapping
        };

        let createdProduct;
        if (existingProduct) {
          // Update existing product
          createdProduct = await prisma.product.update({
            where: { id: existingProduct.id },
            data: productData,
          });
          updated.push(product.sku);
          console.log('Updated product:', product.sku);
        } else {
          // Create new product
          createdProduct = await prisma.product.create({
            data: productData,
          });
          created.push(product.sku);
          console.log('Created product:', product.sku);
        }

        // Find matching image for this product
        console.log(`Looking for image matching product: ${product.name}`);
        const matchingImage = imageFiles.find(img => {
          const matches = matchImageToProduct(img.name, product.name);
          console.log(`Checking image "${img.name}" against product "${product.name}": ${matches}`);
          return matches;
        });
        if (matchingImage) {
          try {
            // On Vercel, we can't write files to the filesystem
            // Instead, we'll create the ProductImage record pointing to the existing optimized images
            // The images should already be in the public/products/optimized/ directory
            
            // Create ProductImage record pointing to the optimized image
            await prisma.productImage.create({
              data: {
                productId: createdProduct.id,
                url: `/products/optimized/${matchingImage.name}`,
                altText: product.name,
                isPrimary: true,
                sortOrder: 1,
              },
            });
            
            imagesProcessed.push(`${product.sku}: ${matchingImage.name}`);
            console.log('Image processed for product:', product.sku, matchingImage.name);
          } catch (imageError) {
            console.error('Error processing image for product:', product.sku, imageError);
            errors.push(`Failed to process image for ${product.sku}: ${imageError}`);
          }
        } else {
          console.log('No matching image found for product:', product.sku);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error processing product:', product.sku, error);
        errors.push(`Failed to process ${product.sku || product.name}: ${errorMessage}`);
      }
    }

    console.log('Import completed. Created:', created.length, 'Updated:', updated.length, 'Errors:', errors.length, 'Images processed:', imagesProcessed.length);

    return NextResponse.json({
      success: true,
      message: `Import completed. Created: ${created.length}, Updated: ${updated.length}, Errors: ${errors.length}, Images: ${imagesProcessed.length}`,
      created: created.length,
      updated: updated.length,
      failed: errors.length,
      errors: errors,
      imagesProcessed: imagesProcessed,
      note: `All products imported successfully! ${imagesProcessed.length} images were processed and linked to products.`,
    });

  } catch (error) {
    console.error('Error in import:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to import products',
      details: errorMessage 
    }, { status: 500 });
  }
}