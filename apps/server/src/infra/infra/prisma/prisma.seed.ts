import 'dotenv/config';
import { PrismaClient, Language } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { services } from './data';
import * as bcrypt from 'bcrypt';

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
  const salt = await bcrypt.genSalt(10);
  await prisma.serviceTranslation.deleteMany({});
  await prisma.service.deleteMany({});

  for (const service of services) {
    await prisma.service.create({
      data: {
        icon: service.icon?.trim() ?? null,
        iconColor: service.iconColor?.trim() ?? null,
        translations: {
          create: service.translations.map((translation) => ({
            language: translation.language as unknown as Language,
            title: translation.title.trim(),
            description: translation.description?.trim() ?? null,
          })),
        },
      },
    });
  }

  await prisma.user.create({
    data: {
      email: "Bekatavkhelidze4@gmail.com",
      password: await bcrypt.hash("beqabeqa", salt)

    }
  })
}

main()
  .catch((error) => {
    console.error('Error occurred while seeding services:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });