# Product Update Guide

This guide explains how to update all product data using a CSV file and the provided script.

## 📋 Overview

The `update-products-from-csv.ts` script allows you to update existing products in bulk using a CSV file. It can update all possible product fields including basic information, plant care details, SEO metadata, and images.

## 🚀 Quick Start

1. **Prepare your CSV file** (see format below)
2. **Run the script:**
   ```bash
   npx tsx scripts/update-products-from-csv.ts your-file.csv
   ```

## 📊 CSV Format

### Required Fields (for identification)
You need at least one of these fields to identify which product to update:

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Product ID (from database) | `clx1234567890abcdef` |
| `slug` | Product slug | `monstera-deliciosa` |
| `sku` | Product SKU | `MONSTERA-LG` |

### Basic Product Information

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Product name | `Monstera Deliciosa` |
| `description` | string | Full product description | `The Monstera Deliciosa is a stunning tropical plant...` |
| `shortDescription` | string | Brief description | `Large tropical plant with distinctive split leaves` |
| `price` | number | Product price | `299.99` |
| `compareAtPrice` | number | Original/compare price | `399.99` |
| `sku` | string | Stock keeping unit | `MONSTERA-LG` |
| `stockQuantity` | number | Available stock | `15` |
| `lowStockThreshold` | number | Low stock warning level | `5` |
| `weight` | number | Product weight in kg | `2.5` |
| `dimensions` | string | Product dimensions | `30x30x80cm` |

### Category
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `category` | string | Category name (will be looked up) | `Indoor Plants` |

### Product Status
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `isActive` | boolean | Whether product is active | `true` or `false` |
| `isFeatured` | boolean | Whether product is featured | `true` or `false` |
| `sortOrder` | number | Display order | `1` |

### Plant-Specific Fields
| Field | Type | Options | Description | Example |
|-------|------|---------|-------------|---------|
| `careLevel` | enum | `EASY`, `MODERATE`, `ADVANCED` | Difficulty of care | `EASY` |
| `lightRequirement` | enum | `LOW`, `MEDIUM`, `BRIGHT`, `DIRECT_SUN` | Light needs | `BRIGHT` |
| `wateringFrequency` | enum | `WEEKLY`, `BI_WEEKLY`, `MONTHLY` | Watering schedule | `WEEKLY` |
| `isPetSafe` | boolean | `true`, `false` | Safe for pets | `false` |
| `plantSize` | enum | `SMALL`, `MEDIUM`, `LARGE` | Plant size | `LARGE` |
| `growthRate` | enum | `SLOW`, `MODERATE`, `FAST` | Growth speed | `MODERATE` |
| `careInstructions` | string | Detailed care instructions | `Water when top 2-3 inches of soil is dry...` |

### SEO Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `metaTitle` | string | SEO title | `Monstera Deliciosa - Large Tropical Plant \| The Plant Store` |
| `metaDescription` | string | SEO description | `Discover the stunning Monstera Deliciosa...` |

### Images
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `images` | string | Pipe-separated image URLs | `https://example.com/img1.jpg\|https://example.com/img2.jpg` |

## 📝 Example CSV

```csv
id,name,description,price,stockQuantity,category,isActive,isFeatured,careLevel,lightRequirement,wateringFrequency,isPetSafe,plantSize,growthRate,careInstructions,metaTitle,metaDescription,images
clx1234567890abcdef,Monstera Deliciosa,The Monstera Deliciosa is a stunning tropical plant known for its distinctive split leaves. Perfect for adding a touch of the jungle to your home.,299.99,15,Indoor Plants,true,true,EASY,BRIGHT,WEEKLY,false,LARGE,MODERATE,Water when top 2-3 inches of soil is dry. Mist leaves regularly for humidity.,Monstera Deliciosa - Large Tropical Plant | The Plant Store,Discover the stunning Monstera Deliciosa with its distinctive split leaves. Perfect for adding tropical vibes to your home.,https://example.com/monstera1.jpg|https://example.com/monstera2.jpg|https://example.com/monstera3.jpg
```

## 🔧 Usage Examples

### Update Only Specific Fields
You can include only the fields you want to update. The script will only update the fields that are present in your CSV:

```csv
id,name,price,stockQuantity
clx1234567890abcdef,Monstera Deliciosa Updated,349.99,20
```

### Update Multiple Products
```csv
id,name,price,isActive
clx1234567890abcdef,Monstera Deliciosa,299.99,true
clx1234567890abcdeg,Snake Plant,89.99,true
clx1234567890abcdeh,Peace Lily,149.99,false
```

### Update Images
```csv
id,images
clx1234567890abcdef,https://new-image1.jpg|https://new-image2.jpg|https://new-image3.jpg
```

### Change Categories
```csv
id,category
clx1234567890abcdef,Outdoor Plants
clx1234567890abcdeg,Succulents
```

## ⚠️ Important Notes

### Field Validation
- **Boolean fields**: Use `true` or `false` (case-sensitive)
- **Enum fields**: Must match exactly (e.g., `EASY`, `MODERATE`, `ADVANCED`)
- **Numbers**: Must be valid numbers (decimals allowed for price/weight)
- **Images**: Separate multiple URLs with `|` (pipe character)

### Product Identification
The script will try to find products in this order:
1. By `id` (if provided)
2. By `slug` (if provided)
3. By `sku` (if provided)

### Category Lookup
- Categories are looked up by name (not ID)
- If a category name is not found, the product update will continue but the category won't be changed
- Make sure category names match exactly (case-sensitive)

### Image Updates
- If you provide the `images` field, it will **replace all existing images** for that product
- Images are separated by `|` (pipe character)
- The first image will be set as the primary image
- Existing images will be deleted before new ones are added

## 🚨 Error Handling

The script provides detailed error reporting:
- **Product not found**: When the identification fields don't match any existing product
- **Category not found**: When a category name doesn't exist
- **Invalid data**: When field values don't match expected formats
- **Database errors**: When updates fail due to constraints or other issues

## 📊 Output

The script will show:
- Number of products found
- Number of products successfully updated
- Number of errors encountered
- Detailed error messages for troubleshooting

## 🔄 Best Practices

1. **Backup your data** before running bulk updates
2. **Test with a small subset** first
3. **Use product IDs** for the most reliable identification
4. **Check category names** match exactly
5. **Validate your CSV** format before running
6. **Review the output** for any errors

## 🛠️ Troubleshooting

### Common Issues

**"Product not found"**
- Check that the ID/slug/SKU exists in your database
- Verify there are no extra spaces in the CSV

**"Category not found"**
- Check that the category name matches exactly (case-sensitive)
- Verify the category exists in your database

**"Invalid data types"**
- Ensure numbers are valid (no letters in number fields)
- Check boolean values are exactly `true` or `false`
- Verify enum values match the allowed options

**"Database constraint errors"**
- Check for unique constraint violations (e.g., duplicate SKUs)
- Verify foreign key relationships are valid

### Getting Help

If you encounter issues:
1. Check the error messages in the script output
2. Verify your CSV format matches the examples
3. Test with a single product first
4. Check that all referenced data (categories, etc.) exists in your database 