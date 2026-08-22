import * as bcrypt from 'bcrypt';
import config from '../../config';
import prisma from '../utils/prisma';
import { AssetType, Role, UserStatus } from '@prisma/client/wasm';

const seedSuperAdmin = async () => {
  try {
    const adminEmail = 'admin@wellora.com.bd';

    // 1️⃣ Check if Super Admin already exists
    const isSuperAdminExists = await prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (!isSuperAdminExists) {
      const hashedPassword = await bcrypt.hash(
        (config.super_admin_password as string) || 'Admin@123456',
        Number(config.bcrypt_salt_rounds) || 12,
      );

      await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: adminEmail,
          password: hashedPassword,
          role: Role.ADMIN,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          phoneNumber: '+8801700000000',
        },
      });

      console.log('✅ Super Admin created successfully (admin@wellora.com.bd).');
    }

    // 2️⃣ Initialize System Settings
    const defaultSettings = [
      { key: 'bronze_commission_rate', value: '0.12', description: 'Bronze tier distributor commission rate (12%)' },
      { key: 'silver_commission_rate', value: '0.15', description: 'Silver tier distributor commission rate (15%)' },
      { key: 'gold_commission_rate', value: '0.18', description: 'Gold tier distributor commission rate (18%)' },
      { key: 'team_override_rate', value: '0.03', description: 'Affiliate parent override commission rate (3%)' },
      { key: 'points_conversion_rate', value: '1.0', description: '1 Loyalty Point = 1 BDT discount' },
    ];

    for (const setting of defaultSettings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      });
    }

    // 3️⃣ Initialize Sample Categories if empty
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      const categories = [
        { name: 'Facial Serums', slug: 'facial-serums', description: 'High potency targeted facial treatments & serums', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be' },
        { name: 'Moisturizers & Creams', slug: 'moisturizers-creams', description: 'Deep hydration and barrier repair daily creams', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03' },
        { name: 'Cleansers & Toners', slug: 'cleansers-toners', description: 'Gentle pH-balancing daily cleansers and soothing toners', image: 'https://images.unsplash.com/photo-1556228722-d0b5be7490bf' },
        { name: 'Sun Protection (SPF)', slug: 'sun-protection', description: 'Broad spectrum lightweight sunscreen lotion and gel', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908' },
        { name: 'Eye & Lip Care', slug: 'eye-lip-care', description: 'Targeted care for delicate eye contours and nourishing lip balms', image: 'https://images.unsplash.com/photo-1608248597359-2e67a747970d' },
      ];

      for (const cat of categories) {
        await prisma.category.create({ data: cat });
      }
      console.log('✅ Initial skincare categories seeded.');
    }

    // 4️⃣ Initialize Sample Products if empty
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      const serumCat = await prisma.category.findFirst({ where: { slug: 'facial-serums' } });
      const creamCat = await prisma.category.findFirst({ where: { slug: 'moisturizers-creams' } });
      const spfCat = await prisma.category.findFirst({ where: { slug: 'sun-protection' } });

      if (serumCat) {
        await prisma.product.create({
          data: {
            brand: 'WELLORA Essentials',
            name: 'Niacinamide 10% + Zinc 1% Clarifying Serum',
            slug: 'niacinamide-10-zinc-1-clarifying-serum',
            categoryId: serumCat.id,
            price: 1250,
            comparePrice: 1500,
            points: 25,
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be',
            description: 'Reduces the appearance of skin blemishes, congestion, and balances visible sebum activity.',
            volume: '30ml',
            keyIngredients: ['Niacinamide', 'Zinc PCA', 'Hyaluronic Acid'],
            skinType: ['Oily', 'Combination', 'Acne-Prone'],
            isTrending: true,
            rating: 4.9,
            reviewsCount: 18,
            inStock: true,
            stockQuantity: 150,
            distributorCommissionRate: 0.15,
          },
        });
      }

      if (creamCat) {
        await prisma.product.create({
          data: {
            brand: 'WELLORA Hydro',
            name: 'Ceramide Barrier Restoring Moisturizer Cream',
            slug: 'ceramide-barrier-restoring-moisturizer-cream',
            categoryId: creamCat.id,
            price: 1450,
            comparePrice: 1750,
            points: 30,
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03',
            description: 'Replenishes ceramides, soothes compromised skin barriers, and locks in 48-hour moisture.',
            volume: '50ml',
            keyIngredients: ['Ceramide Complex', 'Centella Asiatica', 'Glycerin'],
            skinType: ['Dry', 'Sensitive', 'Normal'],
            isTrending: true,
            rating: 5.0,
            reviewsCount: 24,
            inStock: true,
            stockQuantity: 120,
            distributorCommissionRate: 0.15,
          },
        });
      }

      if (spfCat) {
        await prisma.product.create({
          data: {
            brand: 'WELLORA Shield',
            name: 'Invisible Water Sun Gel SPF 50+ PA++++',
            slug: 'invisible-water-sun-gel-spf-50',
            categoryId: spfCat.id,
            price: 1350,
            comparePrice: 1600,
            points: 20,
            image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908',
            description: 'Ultra-lightweight invisible sun gel with zero white cast, broad spectrum UV filters, and antioxidant green tea.',
            volume: '50ml',
            keyIngredients: ['Chemical UV Filters', 'Green Tea Extract', 'Adenosine'],
            skinType: ['All Skin Types', 'Sensitive', 'Oily'],
            isTrending: true,
            rating: 4.8,
            reviewsCount: 15,
            inStock: true,
            stockQuantity: 200,
            distributorCommissionRate: 0.15,
          },
        });
      }
      console.log('✅ Initial skincare products seeded.');
    }

    // 5️⃣ Initialize Sample Marketing Kits if empty
    const kitCount = await prisma.marketingKit.count();
    if (kitCount === 0) {
      await prisma.marketingKit.createMany({
        data: [
          {
            title: 'Summer Glow Social Media Promotion Banner Kit',
            category: 'Social Media',
            formatType: 'PNG / Square 1080x1080',
            type: AssetType.IMAGE,
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03',
            caption: '☀️ Beat the heat with Wellora Hydro Skincare! Share this banner with your referral link to earn 15% instant commission.',
            suggestedPrice: 1450,
            downloadUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03',
            fileSize: '2.4 MB',
            downloadsCount: 34,
            status: 'Published',
          },
          {
            title: 'Niacinamide Clarifying Serum Video Reel (1080x1920)',
            category: 'Video Reels',
            formatType: 'MP4 / 9:16 Story',
            type: AssetType.VIDEO,
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be',
            caption: '🌟 Watch how Wellora Niacinamide transforms pores & acne spots in 14 days! Perfect for TikTok and Instagram Reels.',
            suggestedPrice: 1250,
            downloadUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be',
            fileSize: '14.8 MB',
            downloadsCount: 58,
            status: 'Published',
          },
        ],
      });
      console.log('✅ Initial Marketing Kits seeded.');
    }

    console.log('🎉 Super Admin & Initial DB seeding completed.');
  } catch (error) {
    console.error('❌ Error in seedSuperAdmin:', error);
  }
};

export default seedSuperAdmin;
