import { PrismaClient, KitType, Size } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

type SeedProduct = {
  slug: string;
  name: string;
  club: string;
  kitType: KitType;
  description: string;
  priceInPaise: number;
  imageUrl: string;
  trackInventory: boolean;
  stockBySize?: Partial<Record<Size, number>>;
};

const products: SeedProduct[] = [
  {
    slug: "real-madrid-home-2526",
    name: "Real Madrid Home 25/26",
    club: "Real Madrid",
    kitType: "HOME",
    description:
      "Official-style home kit in classic white. Lightweight fabric, club crest placement, no name or number customization.",
    priceInPaise: 249900,
    imageUrl: "/products/real-madrid-home.svg",
    trackInventory: true,
    stockBySize: { XS: 4, S: 8, M: 12, L: 10, XL: 6, XXL: 3 },
  },
  {
    slug: "real-madrid-away-2526",
    name: "Real Madrid Away 25/26",
    club: "Real Madrid",
    kitType: "AWAY",
    description:
      "Away kit with bold contrast panels. Club kit only — sizes XS–XXL.",
    priceInPaise: 249900,
    imageUrl: "/products/real-madrid-away.svg",
    trackInventory: true,
    stockBySize: { XS: 2, S: 5, M: 9, L: 7, XL: 4, XXL: 2 },
  },
  {
    slug: "barcelona-home-2526",
    name: "Barcelona Home 25/26",
    club: "Barcelona",
    kitType: "HOME",
    description:
      "Blaugrana home jersey. Premium feel replica for everyday wear and match days.",
    priceInPaise: 239900,
    imageUrl: "/products/barcelona-home.svg",
    trackInventory: true,
    stockBySize: { XS: 3, S: 6, M: 11, L: 9, XL: 5, XXL: 2 },
  },
  {
    slug: "barcelona-away-2526",
    name: "Barcelona Away 25/26",
    club: "Barcelona",
    kitType: "AWAY",
    description: "Clean away colourway with classic Barcelona detailing.",
    priceInPaise: 239900,
    imageUrl: "/products/barcelona-away.svg",
    trackInventory: false,
  },
  {
    slug: "manchester-united-home-2526",
    name: "Manchester United Home 25/26",
    club: "Manchester United",
    kitType: "HOME",
    description: "Iconic red home kit. No player personalization in v1.",
    priceInPaise: 229900,
    imageUrl: "/products/man-utd-home.svg",
    trackInventory: true,
    stockBySize: { XS: 5, S: 10, M: 14, L: 12, XL: 7, XXL: 4 },
  },
  {
    slug: "liverpool-third-2526",
    name: "Liverpool Third 25/26",
    club: "Liverpool",
    kitType: "THIRD",
    description: "Third kit — limited colour story for collectors and fans.",
    priceInPaise: 259900,
    imageUrl: "/products/liverpool-third.svg",
    trackInventory: true,
    stockBySize: { XS: 1, S: 3, M: 6, L: 5, XL: 3, XXL: 1 },
  },
  {
    slug: "psg-special-2526",
    name: "PSG Special Edition 25/26",
    club: "Paris Saint-Germain",
    kitType: "SPECIAL",
    description: "Special edition club kit. Inventory not tracked — made to order feel.",
    priceInPaise: 279900,
    imageUrl: "/products/psg-special.svg",
    trackInventory: false,
  },
  {
    slug: "arsenal-home-2526",
    name: "Arsenal Home 25/26",
    club: "Arsenal",
    kitType: "HOME",
    description: "Gunners home red with white sleeves. Club crest placement only.",
    priceInPaise: 229900,
    imageUrl: "/products/arsenal-home.svg",
    trackInventory: true,
    stockBySize: { XS: 4, S: 7, M: 10, L: 8, XL: 5, XXL: 2 },
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.admin.upsert({
    where: { email: "admin@merchende.com" },
    update: { passwordHash, name: "Merchende Admin" },
    create: {
      email: "admin@merchende.com",
      passwordHash,
      name: "Merchende Admin",
    },
  });

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        club: p.club,
        kitType: p.kitType,
        description: p.description,
        priceInPaise: p.priceInPaise,
        imageUrl: p.imageUrl,
        trackInventory: p.trackInventory,
        active: true,
      },
      create: {
        slug: p.slug,
        name: p.name,
        club: p.club,
        kitType: p.kitType,
        description: p.description,
        priceInPaise: p.priceInPaise,
        imageUrl: p.imageUrl,
        trackInventory: p.trackInventory,
        active: true,
      },
    });

    for (const size of SIZES) {
      const stock = p.trackInventory ? (p.stockBySize?.[size] ?? 0) : 0;
      const sku = `${p.slug}-${size}`.toUpperCase();
      await prisma.productVariant.upsert({
        where: { sku },
        update: { stock, size, productId: product.id },
        create: {
          productId: product.id,
          size,
          stock,
          sku,
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log("Admin: admin@merchende.com / admin123");
  console.log(`Products: ${products.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
