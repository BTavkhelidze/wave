import { PrismaService } from "src/infra/infra/prisma/prisma.service";

const prisma = new PrismaService();
async function main() {
  await prisma.service.createMany({
    data: [
      {
        titleEn: 'Fire and Life Safety',
        titleKa: 'ხანძარსაწინააღმდეგო და სიცოცხლის უსაფრთხოების სისტემები',
        descriptionEn:
          'Fire and life safety systems ensure the protection of people and structural integrity during fire-related emergencies. This service includes fire risk assessment, design of fire detection, alarm, and suppression systems, smoke control and ventilation strategies, and planning efficient and safe evacuation routes.',
        descriptionKa:
          'სახანძრო და სიცოცხლის უსაფრთხოების სისტემები უზრუნველყოფს ადამიანების დაცვასა და შენობების მდგრადობას ხანძართან დაკავშირებული საგანგებო სიტუაციების დროს.',
        colors: [
          '#B22222',
          '#FF8C00',
          '#FFD700',
          '#2F4F4F',
          '#DCDCDC'
        ],
        icon: 'FaFireExtinguisher',
        iconColor: 'red'
      },

      {
        titleEn: 'Heating and Cooling',
        titleKa: 'გათბობა და გაგრილება',
        descriptionEn:
          'Energy-efficient heating and cooling systems create a comfortable indoor environment while reducing energy consumption and environmental impact.',
        descriptionKa:
          'გათბობისა და გაგრილების ენერგოეფექტური სისტემები ქმნის კომფორტულ შიდა გარემოს.',
        colors: [
          '#1E90FF',
          '#87CEFA',
          '#FF4500',
          '#F2F2F2',
          '#36454F'
        ],
        icon: 'FaSnowflake',
        iconColor: 'blue'
      }
    ]
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });