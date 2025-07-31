import { getPrismaClient } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { CareLevel, LightRequirement, WateringFrequency, PlantSize, GrowthRate } from '@prisma/client';
import Papa from 'papaparse';

export const maxDuration = 300; // 5 minutes timeout
export const dynamic = 'force-dynamic';

// Helper function to map string values to enum values
function mapEnumValue(value: string, enumType: any): any {
  if (!value) return null;
  const upperValue = value.toUpperCase();
  return Object.values(enumType).includes(upperValue) ? upperValue : null;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Test import endpoint called');
    
    // Parse FormData
    const formData = await request.formData();
    const csvFile = formData.get('file') as File;
    console.log('CSV file received:', csvFile?.name, csvFile?.size);

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
    
    const prisma = getPrismaClient();
    const errors = [];
    const created = [];
    const updated = [];

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

        if (existingProduct) {
          // Update existing product
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: productData,
          });
          updated.push(product.sku);
          console.log('Updated product:', product.sku);
        } else {
          // Create new product
          await prisma.product.create({
            data: productData,
          });
          created.push(product.sku);
          console.log('Created product:', product.sku);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error processing product:', product.sku, error);
        errors.push(`Failed to process ${product.sku || product.name}: ${errorMessage}`);
      }
    }

    console.log('Import completed. Created:', created.length, 'Updated:', updated.length, 'Errors:', errors.length);

    return NextResponse.json({
      success: true,
      message: `Import completed. Created: ${created.length}, Updated: ${updated.length}, Errors: ${errors.length}`,
      created: created.length,
      updated: updated.length,
      failed: errors.length,
      errors: errors,
      note: 'All products imported successfully! Images can be added separately through the product edit interface.',
    });

  } catch (error) {
    console.error('Error in test import:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to import products',
      details: errorMessage 
    }, { status: 500 });
  }
} 