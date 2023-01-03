import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.user.upsert({
    where: { uid: 'Se561raFjoSjJY5Q7kZtwoIHk4H2' },
    update: {},
    create: {
      uid: 'Se561raFjoSjJY5Q7kZtwoIHk4H2',
      email: 'user@user.com',
      name: 'myUser',
      createdAt: new Date(),
      updatedAt: new Date(),
      type: 'ADMIN',
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
