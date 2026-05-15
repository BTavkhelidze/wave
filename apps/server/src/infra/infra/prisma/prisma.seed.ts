import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { services } from './data';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
  }),
});

async function main() {
  console.log('Seeding services...');

  await prisma.serviceTranslation.deleteMany({});
  await prisma.service.deleteMany({});

  for (const service of services) {
    await prisma.service.create({
      data: {
        icon: service.icon?.trim() ?? null,
        iconColor: service.iconColor?.trim() ?? null,
        colors: service.colors.map((color) => color.trim()),

        translations: {
          create: service.translations.map((translation) => ({
            language: translation.language.trim(),
            title: translation.title.trim(),
            description: translation.description?.trim() ?? null,
          })),
        },
      },
    });
  }

  console.log('Services seeded successfully.');
}

main()
  .catch((error) => {
    console.error('Error occurred while seeding services:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });