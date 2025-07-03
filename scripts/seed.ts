import {
  PrismaClient,
  CareLevel,
  LightRequirement,
  WateringFrequency,
  PlantSize,
  GrowthRate,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  console.log("🧹 Cleaning up old data...");
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.shippingRate.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});

  // Create categories
  console.log("📁 Creating categories...");
  const indoorCategory = await prisma.category.upsert({
    where: { name: "Indoor Plants" },
    update: {},
    create: {
      name: "Indoor Plants",
      slug: "indoor-plants",
      description: "Beautiful houseplants perfect for any indoor space",
      isActive: true,
      sortOrder: 1,
    },
  });

  const outdoorCategory = await prisma.category.upsert({
    where: { name: "Outdoor Plants" },
    update: {},
    create: {
      name: "Outdoor Plants",
      slug: "outdoor-plants",
      description: "Hardy plants for your garden and outdoor spaces",
      isActive: true,
      sortOrder: 2,
    },
  });

  const succulentsCategory = await prisma.category.upsert({
    where: { name: "Succulents" },
    update: {},
    create: {
      name: "Succulents",
      slug: "succulents",
      description: "Low-maintenance plants perfect for beginners",
      isActive: true,
      sortOrder: 3,
    },
  });

  const accessoriesCategory = await prisma.category.upsert({
    where: { name: "Accessories" },
    update: {},
    create: {
      name: "Accessories",
      slug: "accessories",
      description: "Everything you need to care for your plants",
      isActive: true,
      sortOrder: 4,
    },
  });

  // Create admin users
  console.log("👥 Creating admin users...");
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@thehouseplantstore.co.za" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@thehouseplantstore.co.za",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  const plantManager = await prisma.user.upsert({
    where: { email: "plants@thehouseplantstore.co.za" },
    update: {},
    create: {
      name: "Plant Manager",
      email: "plants@thehouseplantstore.co.za",
      password: hashedPassword,
      role: "PLANT_MANAGER",
    },
  });

  const orderManager = await prisma.user.upsert({
    where: { email: "orders@thehouseplantstore.co.za" },
    update: {},
    create: {
      name: "Order Manager",
      email: "orders@thehouseplantstore.co.za",
      password: hashedPassword,
      role: "ORDER_MANAGER",
    },
  });

  // Create sample customer
  const customer = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      name: "John Smith",
      email: "john@example.com",
      password: await bcrypt.hash("customer123", 12),
      role: "CUSTOMER",
    },
  });

  // Create suppliers
  console.log("🚚 Creating suppliers...");
  const supplier1 = await prisma.supplier.upsert({
    where: { name: "GreenGrowers Ltd." },
    update: {},
    create: {
      name: "GreenGrowers Ltd.",
      email: "contact@greengrowers.com",
      phone: "+27 21 123 4567",
      address: "45 Plant Lane, Cape Town",
    },
  });
  const supplier2 = await prisma.supplier.upsert({
    where: { name: "Urban Jungle Supplies" },
    update: {},
    create: {
      name: "Urban Jungle Supplies",
      email: "info@urbanjungle.co.za",
      phone: "+27 11 987 6543",
      address: "99 Leafy Ave, Johannesburg",
    },
  });

  // Create indoor plants
  console.log("🏠 Creating indoor plants...");
  const indoorPlants = [
    {
      name: "Monstera Deliciosa",
      slug: "monstera-deliciosa",
      description:
        "The Monstera Deliciosa, also known as the Swiss Cheese Plant, is a tropical plant with distinctive split leaves. It's perfect for adding a dramatic touch to your home decor.",
      shortDescription: "Beautiful tropical plant with iconic split leaves",
      price: 299.99,
      compareAtPrice: 349.99,
      sku: "MON-001",
      stockQuantity: 5, // Set low stock for testing
      lowStockThreshold: 10,
      careLevel: CareLevel.MODERATE,
      lightRequirement: LightRequirement.MEDIUM,
      wateringFrequency: WateringFrequency.WEEKLY,
      isPetSafe: false,
      plantSize: PlantSize.LARGE,
      growthRate: GrowthRate.FAST,
      careInstructions:
        "Water when top soil feels dry. Provide bright, indirect light. Wipe leaves regularly to keep them glossy.",
      isFeatured: true,
      sortOrder: 1,
      supplierId: supplier1.id,
    },
    {
      name: "Snake Plant (Sansevieria)",
      slug: "snake-plant-sansevieria",
      description:
        "The Snake Plant is one of the most popular houseplants due to its striking appearance and low maintenance requirements. Perfect for beginners.",
      shortDescription: "Low-maintenance plant with striking upright leaves",
      price: 149.99,
      compareAtPrice: 179.99,
      sku: "SNK-001",
      stockQuantity: 8, // Set low stock for testing
      lowStockThreshold: 15,
      careLevel: CareLevel.EASY,
      lightRequirement: LightRequirement.LOW,
      wateringFrequency: WateringFrequency.BI_WEEKLY,
      isPetSafe: false,
      plantSize: PlantSize.MEDIUM,
      growthRate: GrowthRate.SLOW,
      careInstructions:
        "Water sparingly. Tolerates low light and neglect. Perfect for busy plant parents.",
      isFeatured: true,
      sortOrder: 2,
      supplierId: supplier2.id,
    },
    {
      name: "Peace Lily",
      slug: "peace-lily",
      description:
        "The Peace Lily is known for its elegant white flowers and glossy green leaves. It's also excellent at purifying indoor air.",
      shortDescription: "Elegant flowering plant with air-purifying qualities",
      price: 199.99,
      sku: "PEA-001",
      stockQuantity: 30,
      careLevel: CareLevel.MODERATE,
      lightRequirement: LightRequirement.MEDIUM,
      wateringFrequency: WateringFrequency.WEEKLY,
      isPetSafe: false,
      plantSize: PlantSize.MEDIUM,
      growthRate: GrowthRate.MODERATE,
      careInstructions:
        "Keep soil consistently moist but not waterlogged. Enjoys humidity.",
      isFeatured: true,
      sortOrder: 3,
    },
    {
      name: "Fiddle Leaf Fig",
      slug: "fiddle-leaf-fig",
      description:
        "The Fiddle Leaf Fig is a statement plant with large, violin-shaped leaves. It's perfect for creating a focal point in any room.",
      shortDescription: "Statement plant with large, dramatic leaves",
      price: 399.99,
      compareAtPrice: 449.99,
      sku: "FID-001",
      stockQuantity: 15,
      careLevel: CareLevel.ADVANCED,
      lightRequirement: LightRequirement.BRIGHT,
      wateringFrequency: WateringFrequency.WEEKLY,
      isPetSafe: false,
      plantSize: PlantSize.LARGE,
      growthRate: GrowthRate.MODERATE,
      careInstructions:
        "Needs bright, indirect light and consistent watering schedule. Sensitive to changes.",
      isFeatured: true,
      sortOrder: 4,
    },
    {
      name: "Golden Pothos",
      slug: "golden-pothos",
      description:
        "The Golden Pothos is a fast-growing vine with heart-shaped leaves. It's extremely easy to care for and looks great in hanging baskets.",
      shortDescription: "Fast-growing vine perfect for hanging baskets",
      price: 89.99,
      sku: "POT-001",
      stockQuantity: 50,
      careLevel: CareLevel.EASY,
      lightRequirement: LightRequirement.MEDIUM,
      wateringFrequency: WateringFrequency.WEEKLY,
      isPetSafe: false,
      plantSize: PlantSize.SMALL,
      growthRate: GrowthRate.FAST,
      careInstructions:
        "Very forgiving. Water when soil feels dry. Can tolerate various light conditions.",
      isFeatured: false,
      sortOrder: 5,
    },
  ];

  for (const plant of indoorPlants) {
    const createdPlant = await prisma.product.upsert({
      where: { slug: plant.slug },
      update: {},
      create: {
        ...plant,
        categoryId: indoorCategory.id,
      },
    });

    // Add sample images
    await prisma.productImage.create({
      data: {
        productId: createdPlant.id,
        url: `https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=500&h=500&fit=crop`,
        altText: `${plant.name} plant`,
        isPrimary: true,
        sortOrder: 1,
      },
    });
  }

  // Create outdoor plants
  console.log("🌳 Creating outdoor plants...");
  const outdoorPlants = [
    {
      name: "Lavender",
      slug: "lavender",
      description:
        "Fragrant purple flowers and silvery foliage make lavender a garden favorite. Great for borders and attracts beneficial insects.",
      shortDescription: "Fragrant herb with beautiful purple flowers",
      price: 79.99,
      sku: "LAV-001",
      stockQuantity: 35,
      careLevel: CareLevel.EASY,
      lightRequirement: LightRequirement.DIRECT_SUN,
      wateringFrequency: WateringFrequency.BI_WEEKLY,
      isPetSafe: true,
      plantSize: PlantSize.MEDIUM,
      growthRate: GrowthRate.MODERATE,
      careInstructions:
        "Needs full sun and well-drained soil. Drought tolerant once established.",
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: "Rosemary",
      slug: "rosemary",
      description:
        "An aromatic herb that's perfect for cooking and landscaping. Forms an attractive evergreen shrub.",
      shortDescription: "Aromatic evergreen herb perfect for cooking",
      price: 69.99,
      sku: "ROS-001",
      stockQuantity: 40,
      careLevel: CareLevel.EASY,
      lightRequirement: LightRequirement.DIRECT_SUN,
      wateringFrequency: WateringFrequency.BI_WEEKLY,
      isPetSafe: true,
      plantSize: PlantSize.MEDIUM,
      growthRate: GrowthRate.SLOW,
      careInstructions:
        "Thrives in full sun with minimal water. Harvest regularly to encourage growth.",
      isFeatured: false,
      sortOrder: 2,
    },
  ];

  for (const plant of outdoorPlants) {
    const createdPlant = await prisma.product.create({
      data: {
        ...plant,
        categoryId: outdoorCategory.id,
      },
    });

    await prisma.productImage.create({
      data: {
        productId: createdPlant.id,
        url: `https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=500&fit=crop`,
        altText: `${plant.name} plant`,
        isPrimary: true,
        sortOrder: 1,
      },
    });
  }

  // Create succulents
  console.log("🌵 Creating succulents...");
  const succulents = [
    {
      name: "Aloe Vera",
      slug: "aloe-vera",
      description:
        "Known for its healing properties, Aloe Vera is a must-have succulent. Easy to care for and useful for burns and cuts.",
      shortDescription: "Healing succulent with medicinal properties",
      price: 59.99,
      sku: "ALO-001",
      stockQuantity: 45,
      careLevel: CareLevel.EASY,
      lightRequirement: LightRequirement.BRIGHT,
      wateringFrequency: WateringFrequency.MONTHLY,
      isPetSafe: false,
      plantSize: PlantSize.SMALL,
      growthRate: GrowthRate.SLOW,
      careInstructions:
        "Water deeply but infrequently. Needs bright light but protect from harsh afternoon sun.",
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: "Jade Plant",
      slug: "jade-plant",
      description:
        "The Jade Plant is considered a symbol of good luck and prosperity. Its thick, glossy leaves make it an attractive houseplant.",
      shortDescription: "Lucky plant with thick, glossy leaves",
      price: 49.99,
      sku: "JAD-001",
      stockQuantity: 50,
      careLevel: CareLevel.EASY,
      lightRequirement: LightRequirement.BRIGHT,
      wateringFrequency: WateringFrequency.BI_WEEKLY,
      isPetSafe: false,
      plantSize: PlantSize.SMALL,
      growthRate: GrowthRate.SLOW,
      careInstructions:
        "Allow soil to dry completely between waterings. Prefers bright, indirect light.",
      isFeatured: false,
      sortOrder: 2,
    },
  ];

  for (const plant of succulents) {
    const createdPlant = await prisma.product.create({
      data: {
        ...plant,
        categoryId: succulentsCategory.id,
      },
    });

    await prisma.productImage.create({
      data: {
        productId: createdPlant.id,
        url: `https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&h=500&fit=crop`,
        altText: `${plant.name} succulent`,
        isPrimary: true,
        sortOrder: 1,
      },
    });
  }

  // Create accessories
  console.log("🛠️ Creating accessories...");
  const accessories = [
    {
      name: "Ceramic Pot - Large",
      slug: "ceramic-pot-large",
      description:
        "Beautiful handcrafted ceramic pot with drainage hole. Perfect for medium to large plants.",
      shortDescription: "Handcrafted ceramic pot with drainage",
      price: 129.99,
      sku: "POT-CER-L",
      stockQuantity: 25,
      plantSize: PlantSize.LARGE,
      careInstructions:
        "Clean with damp cloth. Ensure proper drainage for plant health.",
      isFeatured: false,
      sortOrder: 1,
    },
    {
      name: "Plant Food - All Purpose",
      slug: "plant-food-all-purpose",
      description:
        "Premium liquid plant food suitable for all indoor and outdoor plants. Promotes healthy growth and vibrant foliage.",
      shortDescription: "Premium liquid fertilizer for all plants",
      price: 39.99,
      sku: "FOOD-001",
      stockQuantity: 60,
      careInstructions:
        "Dilute according to instructions. Apply monthly during growing season.",
      isFeatured: false,
      sortOrder: 2,
    },
  ];

  for (const accessory of accessories) {
    const createdProduct = await prisma.product.create({
      data: {
        ...accessory,
        categoryId: accessoriesCategory.id,
      },
    });

    await prisma.productImage.create({
      data: {
        productId: createdProduct.id,
        url: `https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&h=500&fit=crop`,
        altText: `${accessory.name}`,
        isPrimary: true,
        sortOrder: 1,
      },
    });
  }

  // Create shipping rates for all SA provinces
  console.log("🚚 Creating shipping rates...");
  const provinces = [
    { province: "GAUTENG", rate: 85.0 },
    { province: "WESTERN_CAPE", rate: 120.0 },
    { province: "KWAZULU_NATAL", rate: 110.0 },
    { province: "EASTERN_CAPE", rate: 130.0 },
    { province: "LIMPOPO", rate: 140.0 },
    { province: "MPUMALANGA", rate: 125.0 },
    { province: "NORTH_WEST", rate: 115.0 },
    { province: "NORTHERN_CAPE", rate: 150.0 },
    { province: "FREE_STATE", rate: 105.0 },
  ];

  for (const provinceData of provinces) {
    await prisma.shippingRate.upsert({
      where: { province: provinceData.province as any },
      update: {},
      create: {
        province: provinceData.province as any,
        rate: provinceData.rate,
        freeThreshold: 500.0,
        isActive: true,
      },
    });
  }

  // Create sample customer address
  console.log("📍 Creating sample address...");
  await prisma.address.create({
    data: {
      userId: customer.id,
      firstName: "John",
      lastName: "Smith",
      addressLine1: "123 Main Street",
      city: "Johannesburg",
      province: "GAUTENG",
      postalCode: "2001",
      phone: "+27 11 123 4567",
      isDefault: true,
    },
  });

  // Create sample reviews
  console.log("⭐ Creating sample reviews...");
  const products = await prisma.product.findMany({
    where: { categoryId: indoorCategory.id },
    take: 3,
  });

  for (const product of products) {
    await prisma.review.create({
      data: {
        userId: customer.id,
        productId: product.id,
        rating: 5,
        title: "Amazing plant!",
        comment:
          "This plant exceeded my expectations. It arrived in perfect condition and has been thriving in my home. Highly recommended!",
        isVerified: true,
        isApproved: true,
      },
    });
  }

  // Create sample order
  console.log("📦 Creating sample order...");
  const firstProduct = products[0];
  if (firstProduct) {
    const order = await prisma.order.upsert({
      where: { orderNumber: "ORD-2024-001" },
      update: {},
      create: {
        orderNumber: "ORD-2024-001",
        userId: customer.id,
        status: "DELIVERED",
        paymentMethod: "YOCO",
        paymentStatus: "PAID",
        shippingMethod: "STANDARD",
        subtotal: Number(firstProduct.price),
        shippingCost: 85.0,
        totalAmount: Number(firstProduct.price) + 85.0,
        paidAt: new Date(),
        deliveredAt: new Date(),
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: firstProduct.id,
        quantity: 1,
        price: Number(firstProduct.price),
        totalPrice: Number(firstProduct.price),
        productName: firstProduct.name,
        productSku: firstProduct.sku,
        costPrice: Number(firstProduct.price),
      },
    });
  }

  console.log("✅ Database seeding completed successfully!");
  console.log(`
📊 Seeding Summary:
- Categories: 4 (Indoor Plants, Outdoor Plants, Succulents, Accessories)
- Products: ${indoorPlants.length + outdoorPlants.length + succulents.length + accessories.length}
- Users: 4 (1 Super Admin, 1 Plant Manager, 1 Order Manager, 1 Customer)
- Shipping Rates: 9 (All SA provinces)
- Reviews: 3
- Orders: 1

🔑 Admin Credentials:
- Super Admin: admin@thehouseplantstore.co.za / admin123
- Plant Manager: plants@thehouseplantstore.co.za / admin123
- Order Manager: orders@thehouseplantstore.co.za / admin123

👤 Customer Credentials:
- Customer: john@example.com / customer123
  `);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
