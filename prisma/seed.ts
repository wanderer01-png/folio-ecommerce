import { prisma } from "../src/lib/prisma";

const categories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Apparel", slug: "apparel" },
  { name: "Home & Kitchen", slug: "home-kitchen" },
  { name: "Books", slug: "books" },
] as const;

const products = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    slug: "wireless-noise-cancelling-headphones",
    description:
      "Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.",
    price: "199.99",
    images: ["https://picsum.photos/seed/headphones/600/600"],
    stock: 45,
    categorySlug: "electronics",
  },
  {
    name: "Smart Fitness Watch",
    slug: "smart-fitness-watch",
    description:
      "Tracks heart rate, sleep, and workouts, with a 7-day battery and always-on display.",
    price: "149.5",
    images: ["https://picsum.photos/seed/watch/600/600"],
    stock: 60,
    categorySlug: "electronics",
  },
  {
    name: "Portable Bluetooth Speaker",
    slug: "portable-bluetooth-speaker",
    description: "Waterproof speaker with 360-degree sound and 12-hour playtime.",
    price: "59.0",
    images: ["https://picsum.photos/seed/speaker/600/600"],
    stock: 80,
    categorySlug: "electronics",
  },
  {
    name: "Classic Cotton T-Shirt",
    slug: "classic-cotton-tshirt",
    description: "Soft, breathable 100% cotton t-shirt available in multiple colors.",
    price: "19.99",
    images: ["https://picsum.photos/seed/tshirt/600/600"],
    stock: 200,
    categorySlug: "apparel",
  },
  {
    name: "Slim Fit Denim Jeans",
    slug: "slim-fit-denim-jeans",
    description: "Stretch denim jeans with a modern slim fit and reinforced stitching.",
    price: "54.99",
    images: ["https://picsum.photos/seed/jeans/600/600"],
    stock: 120,
    categorySlug: "apparel",
  },
  {
    name: "Lightweight Rain Jacket",
    slug: "lightweight-rain-jacket",
    description: "Packable, water-resistant jacket built for unpredictable weather.",
    price: "89.0",
    images: ["https://picsum.photos/seed/jacket/600/600"],
    stock: 70,
    categorySlug: "apparel",
  },
  {
    name: "Stainless Steel Cookware Set",
    slug: "stainless-steel-cookware-set",
    description: "10-piece cookware set with tri-ply construction for even heat distribution.",
    price: "249.99",
    images: ["https://picsum.photos/seed/cookware/600/600"],
    stock: 25,
    categorySlug: "home-kitchen",
  },
  {
    name: "Ceramic Coffee Mug Set",
    slug: "ceramic-coffee-mug-set",
    description: "Set of 4 handcrafted ceramic mugs, microwave and dishwasher safe.",
    price: "29.99",
    images: ["https://picsum.photos/seed/mugs/600/600"],
    stock: 150,
    categorySlug: "home-kitchen",
  },
  {
    name: "Robot Vacuum Cleaner",
    slug: "robot-vacuum-cleaner",
    description: "Smart robot vacuum with app control, mapping, and auto-recharge.",
    price: "329.0",
    images: ["https://picsum.photos/seed/vacuum/600/600"],
    stock: 30,
    categorySlug: "home-kitchen",
  },
  {
    name: "The Pragmatic Programmer",
    slug: "the-pragmatic-programmer",
    description: "A classic guide to becoming a more effective, adaptable software developer.",
    price: "39.99",
    images: ["https://picsum.photos/seed/book1/600/600"],
    stock: 90,
    categorySlug: "books",
  },
  {
    name: "Atomic Habits",
    slug: "atomic-habits",
    description: "A practical guide to building good habits and breaking bad ones.",
    price: "24.99",
    images: ["https://picsum.photos/seed/book2/600/600"],
    stock: 110,
    categorySlug: "books",
  },
] as const;

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  for (const product of products) {
    const { categorySlug, ...productData } = product;
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: categorySlug },
    });

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...productData,
        images: [...productData.images],
        categoryId: category.id,
      },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
