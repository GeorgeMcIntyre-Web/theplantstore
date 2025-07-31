# Image Import Guide - Avoiding 413 (Content Too Large) Error

## Problem Solved ✅

The 413 error was caused by trying to upload 86.54MB of image files at once. We've optimized the images to reduce the total size to just 1.26MB (98.5% reduction).

## How to Import Products Now

### Option 1: Use Optimized Images (Recommended)

1. **Use the optimized images** located in `public/products/optimized/`
   - These are the same images but much smaller (98.5% smaller)
   - Total size: 1.26MB instead of 86.54MB

2. **Import Process:**
   - Go to Admin → Products → Import
   - Upload your `GemInventory.csv` file
   - Upload the optimized images from `public/products/optimized/`
   - Click "Preview Import" then "Import Products"

### Option 2: Import CSV First, Then Add Images

1. **Import CSV data only:**
   - Upload just the `GemInventory.csv` file
   - The system will automatically detect the large file size and import CSV only
   - Products will be created without images

2. **Add images later:**
   - Use the optimized images from `public/products/optimized/`
   - Upload them individually or in small batches

## Image Optimization Details

- **Original size:** 86.54MB
- **Optimized size:** 1.26MB
- **Savings:** 98.5%
- **Quality:** Still high quality (800x800px, 80% JPEG quality)
- **Format:** Converted to JPEG for better compression

## Technical Changes Made

1. **Fixed API endpoint** to properly handle FormData
2. **Added authentication** to the import endpoint
3. **Created image optimization script** (`scripts/optimize-images.js`)
4. **Updated frontend** to handle large file uploads gracefully
5. **Added middleware** for better file upload handling

## Files Modified

- `app/api/admin/import/products/route.ts` - Fixed FormData handling
- `app/admin/products/import/page.tsx` - Added size checking and CSV-only import
- `next.config.js` - Added experimental features
- `middleware.ts` - Added file upload handling
- `scripts/optimize-images.js` - Image optimization script

## Next Steps

1. Try importing with the optimized images first
2. If you still get errors, use the CSV-only import option
3. The system will now handle large uploads much better

## Troubleshooting

If you still encounter issues:

1. **Check file sizes** - Make sure you're using the optimized images
2. **Try CSV-only import** - Import data first, then add images separately
3. **Check browser console** - Look for any error messages
4. **Restart the development server** - Sometimes needed after config changes

The 413 error should now be resolved! 🎉 