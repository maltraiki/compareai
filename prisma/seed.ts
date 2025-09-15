import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'Smartphones',
    slug: 'iphone-15-pro',
    description: 'Latest flagship iPhone with titanium design and A17 Pro chip',
    currentPrice: 999,
    specifications: {
      display: '6.1" Super Retina XDR',
      processor: 'A17 Pro',
      ram: '8GB',
      storage: ['128GB', '256GB', '512GB', '1TB'],
      camera: '48MP main + 12MP ultra-wide + 12MP telephoto',
      battery: '3274 mAh',
      os: 'iOS 17',
      '5G': true,
      weight: '187g'
    },
    images: [
      'https://example.com/iphone15pro.jpg'
    ],
    affiliateLinks: {
      amazon: 'https://amazon.com/...',
      bestbuy: 'https://bestbuy.com/...',
      apple: 'https://apple.com/...'
    }
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Smartphones',
    slug: 'samsung-galaxy-s24-ultra',
    description: 'Premium Android flagship with S Pen and advanced AI features',
    currentPrice: 1199,
    specifications: {
      display: '6.8" Dynamic AMOLED 2X',
      processor: 'Snapdragon 8 Gen 3',
      ram: '12GB',
      storage: ['256GB', '512GB', '1TB'],
      camera: '200MP main + 12MP ultra-wide + 50MP telephoto + 10MP telephoto',
      battery: '5000 mAh',
      os: 'Android 14',
      '5G': true,
      weight: '232g',
      'S Pen': 'Included'
    },
    images: [
      'https://example.com/s24ultra.jpg'
    ],
    affiliateLinks: {
      amazon: 'https://amazon.com/...',
      bestbuy: 'https://bestbuy.com/...',
      samsung: 'https://samsung.com/...'
    }
  },
  {
    name: 'MacBook Air M3',
    brand: 'Apple',
    category: 'Laptops',
    slug: 'macbook-air-m3',
    description: '13-inch ultra-portable laptop with Apple Silicon M3 chip',
    currentPrice: 1099,
    specifications: {
      display: '13.6" Liquid Retina',
      processor: 'Apple M3',
      ram: ['8GB', '16GB', '24GB'],
      storage: ['256GB', '512GB', '1TB', '2TB'],
      battery: 'Up to 18 hours',
      weight: '1.24kg',
      ports: '2x Thunderbolt/USB 4, MagSafe 3, 3.5mm jack',
      os: 'macOS Sonoma'
    },
    images: [
      'https://example.com/macbookair.jpg'
    ],
    affiliateLinks: {
      amazon: 'https://amazon.com/...',
      bestbuy: 'https://bestbuy.com/...',
      apple: 'https://apple.com/...'
    }
  },
  {
    name: 'Dell XPS 13',
    brand: 'Dell',
    category: 'Laptops',
    slug: 'dell-xps-13',
    description: 'Premium Windows ultrabook with InfinityEdge display',
    currentPrice: 999,
    specifications: {
      display: '13.4" FHD+ or 4K',
      processor: 'Intel Core i7-1360P',
      ram: ['8GB', '16GB', '32GB'],
      storage: ['512GB', '1TB', '2TB'],
      battery: 'Up to 12 hours',
      weight: '1.17kg',
      ports: '2x Thunderbolt 4, 3.5mm jack',
      os: 'Windows 11'
    },
    images: [
      'https://example.com/dellxps13.jpg'
    ],
    affiliateLinks: {
      amazon: 'https://amazon.com/...',
      bestbuy: 'https://bestbuy.com/...',
      dell: 'https://dell.com/...'
    }
  },
  {
    name: 'iPad Air',
    brand: 'Apple',
    category: 'Tablets',
    slug: 'ipad-air',
    description: '10.9-inch tablet with M1 chip and Apple Pencil support',
    currentPrice: 599,
    specifications: {
      display: '10.9" Liquid Retina',
      processor: 'Apple M1',
      ram: '8GB',
      storage: ['64GB', '256GB'],
      camera: '12MP rear, 12MP front',
      battery: 'Up to 10 hours',
      weight: '461g',
      'Apple Pencil': '2nd generation support',
      os: 'iPadOS 17'
    },
    images: [
      'https://example.com/ipadair.jpg'
    ],
    affiliateLinks: {
      amazon: 'https://amazon.com/...',
      bestbuy: 'https://bestbuy.com/...',
      apple: 'https://apple.com/...'
    }
  },
  {
    name: 'Samsung Galaxy Tab S9',
    brand: 'Samsung',
    category: 'Tablets',
    slug: 'samsung-galaxy-tab-s9',
    description: '11-inch Android tablet with S Pen included',
    currentPrice: 799,
    specifications: {
      display: '11" Dynamic AMOLED 2X',
      processor: 'Snapdragon 8 Gen 2',
      ram: '8GB/12GB',
      storage: ['128GB', '256GB', '512GB'],
      camera: '13MP rear, 12MP front',
      battery: '8400 mAh',
      weight: '498g',
      'S Pen': 'Included',
      os: 'Android 13'
    },
    images: [
      'https://example.com/tabs9.jpg'
    ],
    affiliateLinks: {
      amazon: 'https://amazon.com/...',
      bestbuy: 'https://bestbuy.com/...',
      samsung: 'https://samsung.com/...'
    }
  }
];

async function main() {
  console.log('Starting seed...');
  
  // Clear existing data
  await prisma.comparison.deleteMany();
  await prisma.product.deleteMany();
  
  // Insert products
  for (const product of sampleProducts) {
    await prisma.product.create({
      data: {
        ...product,
        specifications: JSON.stringify(product.specifications),
        images: JSON.stringify(product.images),
        affiliateLinks: JSON.stringify(product.affiliateLinks),
        priceHistory: JSON.stringify([
          { date: new Date().toISOString(), price: product.currentPrice }
        ])
      }
    });
    console.log(`Created product: ${product.name}`);
  }
  
  // Create some sample comparisons
  const iphone = await prisma.product.findUnique({ where: { slug: 'iphone-15-pro' } });
  const samsung = await prisma.product.findUnique({ where: { slug: 'samsung-galaxy-s24-ultra' } });
  const macbook = await prisma.product.findUnique({ where: { slug: 'macbook-air-m3' } });
  const dell = await prisma.product.findUnique({ where: { slug: 'dell-xps-13' } });
  
  if (iphone && samsung) {
    await prisma.comparison.create({
      data: {
        slug: 'iphone-15-pro-vs-samsung-galaxy-s24-ultra',
        title: 'iPhone 15 Pro vs Samsung Galaxy S24 Ultra',
        product1Id: iphone.id,
        product2Id: samsung.id,
        seoContent: 'Comprehensive comparison between iPhone 15 Pro and Samsung Galaxy S24 Ultra...',
        viewCount: 150
      }
    });
    console.log('Created comparison: iPhone 15 Pro vs Samsung Galaxy S24 Ultra');
  }
  
  if (macbook && dell) {
    await prisma.comparison.create({
      data: {
        slug: 'macbook-air-m3-vs-dell-xps-13',
        title: 'MacBook Air M3 vs Dell XPS 13',
        product1Id: macbook.id,
        product2Id: dell.id,
        seoContent: 'Detailed comparison between MacBook Air M3 and Dell XPS 13...',
        viewCount: 85
      }
    });
    console.log('Created comparison: MacBook Air M3 vs Dell XPS 13');
  }
  
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });