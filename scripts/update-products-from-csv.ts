import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductUpdateData {
  // Required fields for identification
  id?: string;
  slug?: string;
  sku?: string;
  
  // Basic product information
  name?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  compareAtPrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  weight?: number;
  dimensions?: string;
  
  // Category
  category?: string; // Category name (will be looked up)
  
  // Product status
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  
  // Plant-specific fields
  careLevel?: 'EASY' | 'MODERATE' | 'ADVANCED';
  lightRequirement?: 'LOW' | 'MEDIUM' | 'BRIGHT' | 'DIRECT_SUN';
  wateringFrequency?: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  isPetSafe?: boolean;
  plantSize?: 'SMALL' | 'MEDIUM' | 'LARGE';
  growthRate?: 'SLOW' | 'MODERATE' | 'FAST';
  careInstructions?: string;
  
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  
  // Images (comma-separated URLs)
  images?: string;
}

// Enum value sets for validation
const CARE_LEVELS = ["EASY", "MODERATE", "ADVANCED"];
const LIGHT_REQUIREMENTS = ["LOW", "MEDIUM", "BRIGHT", "DIRECT_SUN"];
const WATERING_FREQUENCIES = ["WEEKLY", "BI_WEEKLY", "MONTHLY"];
const PLANT_SIZES = ["SMALL", "MEDIUM", "LARGE"];
const GROWTH_RATES = ["SLOW", "MODERATE", "FAST"];

async function updateProductsFromCSV(csvFilePath: string) {
  console.log('🔄 Starting product update from CSV...');
  
  try {
    // Read and parse CSV file
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataLines = lines.slice(1);
    
    console.log(`📊 Found ${dataLines.length} products to update`);
    console.log(`📋 Headers: ${headers.join(', ')}`);
    
    let updated = 0;
    let errors = 0;
    const errorDetails: string[] = [];
    
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      let values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length < headers.length) {
        console.warn(`⚠️  Row ${i + 2} skipped: fewer columns than headers.`);
        errorDetails.push(`Row ${i + 2}: Skipped, not enough columns.`);
        continue;
      }
      if (values.length > headers.length) {
        values = values.slice(0, headers.length);
      }
      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });
      
      try {
        // Find the product to update
        let product = null;
        if (rowData.id) {
          product = await prisma.product.findUnique({ where: { id: rowData.id } });
        } else if (rowData.slug) {
          product = await prisma.product.findUnique({ where: { slug: rowData.slug } });
        } else if (rowData.sku) {
          product = await prisma.product.findUnique({ where: { sku: rowData.sku } });
        }
        
        if (!product) {
          const identifier = rowData.id || rowData.slug || rowData.sku;
          console.log(`❌ Product not found: ${identifier}`);
          errorDetails.push(`Row ${i + 2}: Product not found (${identifier})`);
          errors++;
          continue;
        }
        
        // Prepare update data
        const updateData: any = {};
        
        // Basic fields
        if (rowData.name) updateData.name = rowData.name;
        if (rowData.description) updateData.description = rowData.description;
        if (rowData.shortDescription) updateData.shortDescription = rowData.shortDescription;
        if (rowData.price) updateData.price = parseFloat(rowData.price);
        if (rowData.compareAtPrice) updateData.compareAtPrice = parseFloat(rowData.compareAtPrice);
        if (rowData.stockQuantity) updateData.stockQuantity = parseInt(rowData.stockQuantity);
        if (rowData.lowStockThreshold) updateData.lowStockThreshold = parseInt(rowData.lowStockThreshold);
        if (rowData.weight) updateData.weight = parseFloat(rowData.weight);
        if (rowData.dimensions) updateData.dimensions = rowData.dimensions;
        if (rowData.sku) updateData.sku = rowData.sku;
        
        // Boolean fields
        if (rowData.isActive !== undefined) updateData.isActive = rowData.isActive === 'true';
        if (rowData.isFeatured !== undefined) updateData.isFeatured = rowData.isFeatured === 'true';
        if (rowData.isPetSafe !== undefined) updateData.isPetSafe = rowData.isPetSafe === 'true';
        
        // Integer fields
        if (rowData.sortOrder) updateData.sortOrder = parseInt(rowData.sortOrder);
        
        // Enum fields with validation
        if (rowData.careLevel && CARE_LEVELS.includes(rowData.careLevel)) {
          updateData.careLevel = rowData.careLevel;
        } else if (rowData.careLevel) {
          updateData.careLevel = null;
          if (rowData.careLevel) errorDetails.push(`Row ${i + 2}: Invalid careLevel '${rowData.careLevel}'`);
        }
        if (rowData.lightRequirement && LIGHT_REQUIREMENTS.includes(rowData.lightRequirement)) {
          updateData.lightRequirement = rowData.lightRequirement;
        } else if (rowData.lightRequirement) {
          updateData.lightRequirement = null;
          if (rowData.lightRequirement) errorDetails.push(`Row ${i + 2}: Invalid lightRequirement '${rowData.lightRequirement}'`);
        }
        if (rowData.wateringFrequency && WATERING_FREQUENCIES.includes(rowData.wateringFrequency)) {
          updateData.wateringFrequency = rowData.wateringFrequency;
        } else if (rowData.wateringFrequency) {
          updateData.wateringFrequency = null;
          if (rowData.wateringFrequency) errorDetails.push(`Row ${i + 2}: Invalid wateringFrequency '${rowData.wateringFrequency}'`);
        }
        if (rowData.plantSize && PLANT_SIZES.includes(rowData.plantSize)) {
          updateData.plantSize = rowData.plantSize;
        } else if (rowData.plantSize) {
          updateData.plantSize = null;
          if (rowData.plantSize) errorDetails.push(`Row ${i + 2}: Invalid plantSize '${rowData.plantSize}'`);
        }
        if (rowData.growthRate && GROWTH_RATES.includes(rowData.growthRate)) {
          updateData.growthRate = rowData.growthRate;
        } else if (rowData.growthRate) {
          updateData.growthRate = null;
          if (rowData.growthRate) errorDetails.push(`Row ${i + 2}: Invalid growthRate '${rowData.growthRate}'`);
        }
        
        // Text fields
        if (rowData.careInstructions) updateData.careInstructions = rowData.careInstructions;
        if (rowData.metaTitle) updateData.metaTitle = rowData.metaTitle;
        if (rowData.metaDescription) updateData.metaDescription = rowData.metaDescription;
        
        // Handle category update
        if (rowData.category) {
          const category = await prisma.category.findUnique({
            where: { name: rowData.category }
          });
          if (category) {
            updateData.categoryId = category.id;
          } else {
            console.log(`⚠️  Category not found: ${rowData.category} for product ${product.name}`);
            errorDetails.push(`Row ${i + 2}: Category "${rowData.category}" not found for product "${product.name}"`);
          }
        }
        
        // Handle images update (if provided)
        if (rowData.images) {
          const imageUrls = rowData.images.split('|').map((url: string) => url.trim()).filter(Boolean);
          
          if (imageUrls.length > 0) {
            // Delete existing images
            await prisma.productImage.deleteMany({
              where: { productId: product.id }
            });
            
            // Create new images
            updateData.images = {
              create: imageUrls.map((url: string, index: number) => ({
                url: url,
                altText: `${updateData.name || product.name} - Image ${index + 1}`,
                sortOrder: index,
                isPrimary: index === 0
              }))
            };
          }
        }
        
        // Update the product
        await prisma.product.update({
          where: { id: product.id },
          data: updateData,
          include: {
            category: true,
            images: true
          }
        });
        
        console.log(`✅ Updated product: ${product.name}`);
        updated++;
        
      } catch (error) {
        console.error(`❌ Error updating product in row ${i + 2}:`, error);
        errorDetails.push(`Row ${i + 2}: ${error}`);
        errors++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Updated: ${updated} products`);
    console.log(`❌ Errors: ${errors} products`);
    
    if (errorDetails.length > 0) {
      console.log('\n❌ Error Details:');
      errorDetails.forEach(detail => console.log(`  - ${detail}`));
    }
    
    if (updated > 0) {
      console.log('\n🎉 Successfully updated products!');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Example usage
const csvFilePath = process.argv[2];
if (!csvFilePath) {
  console.log('❌ Please provide the path to your CSV file');
  console.log('Usage: npx tsx scripts/update-products-from-csv.ts <path-to-csv>');
  console.log('\n📋 Expected CSV format:');
  console.log('id,name,description,price,stockQuantity,category,isActive,isFeatured,careLevel,lightRequirement,wateringFrequency,isPetSafe,plantSize,growthRate,careInstructions,metaTitle,metaDescription,images');
  process.exit(1);
}

updateProductsFromCSV(csvFilePath)
  .then(() => {
    console.log('🏁 Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 