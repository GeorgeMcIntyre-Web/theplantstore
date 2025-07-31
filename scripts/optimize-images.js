const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const productsDir = path.join(__dirname, '../public/products');
const optimizedDir = path.join(__dirname, '../public/products/optimized');

// Create optimized directory if it doesn't exist
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

async function optimizeImages() {
  try {
    const files = fs.readdirSync(productsDir).filter(file => 
      file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')
    );

    console.log(`Found ${files.length} images to optimize...`);

    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    for (const file of files) {
      const inputPath = path.join(productsDir, file);
      const outputPath = path.join(optimizedDir, file);
      
      const stats = fs.statSync(inputPath);
      totalOriginalSize += stats.size;

      console.log(`Optimizing ${file}...`);
      
      await sharp(inputPath)
        .resize(800, 800, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 80, 
          progressive: true 
        })
        .toFile(outputPath);

      const optimizedStats = fs.statSync(outputPath);
      totalOptimizedSize += optimizedStats.size;

      const savings = ((stats.size - optimizedStats.size) / stats.size * 100).toFixed(1);
      console.log(`  ${file}: ${(stats.size / 1024 / 1024).toFixed(2)}MB → ${(optimizedStats.size / 1024 / 1024).toFixed(2)}MB (${savings}% smaller)`);
    }

    console.log('\nOptimization complete!');
    console.log(`Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Total optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Total savings: ${((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1)}%`);
    console.log(`\nOptimized images saved to: ${optimizedDir}`);
    console.log('Use these optimized images for your import to avoid the 413 error.');

  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

optimizeImages(); 