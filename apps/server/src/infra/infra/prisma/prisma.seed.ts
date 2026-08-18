import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { services } from './data';
import { genSalt, hash } from 'bcrypt';
import { normalizeServiceSlug } from '../../../api/services/lib/service-slug.util';

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const salt = await genSalt(10);
  await prisma.serviceTranslation.deleteMany({});
  await prisma.service.deleteMany({});

  for (const service of services) {
    await prisma.service.create({
      data: {
        icon: service.icon?.trim() ?? null,
        iconColor: service.iconColor?.trim() ?? null,
        animationColors: service.animationColors,
        translations: {
          create: service.translations.map((translation, index) => {
            const normalizedSlug = normalizeServiceSlug(translation.title);

            return {
              language: translation.language,
              title: translation.title.trim(),
              description: translation.description?.trim() ?? null,
              slug:
                normalizedSlug ||
                `service-${index + 1}-${translation.language.toLowerCase()}`,
            };
          }),
        },
      },
    });
  }

  await prisma.user.upsert({
    where: {
      email: 'bekatavkhelidze41@gmail.com',
    },
    update: {
      firstName: 'Beka',
      lastName: 'Tavkhelidze',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    },
    create: {
      firstName: 'Beka',
      lastName: 'Tavkhelidze',
      email: 'bekatavkhelidze41@gmail.com',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      password: await hash('beqabeqa', salt),
      hashedRefreshToken: null,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    },
  });
}

main()
  .catch((error) => {
    console.error('Error occurred while seeding services:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
