import dotenv from 'dotenv';
import { PrismaClient, Roles } from '@prisma/client';
import argon2 from 'argon2';

const roleList = [{ name: Roles.USER }, { name: Roles.ADMIN }, { name: Roles.SUPER_ADMIN }];
const defaultUsers = [{ username: 'super_admin' }, { username: 'admin' }, { username: 'user' }];

dotenv.config({
  path: `${process.cwd()}/.env`,
});

const prisma = new PrismaClient();

const run = async () => {
  try {
    const hashedPassword = await argon2.hash('123456');

    await prisma.$connect();

    await prisma.$transaction(
      defaultUsers.map(({ username }) =>
        prisma.role.create({
          data: {
            username,
            password: hashedPassword,
          },
        }),
      ),
    );

    await prisma.$transaction(roleList.map((role) => prisma.role.create({ data: role })));

    const roles = await prisma.role.findMany();
    const users = await prisma.user.findMany();

    await prisma.$transaction(
      users.map((user) =>
        prisma.userRoles.create({
          data: {
            userId: user.id,
            roleId: roles.find((role) => role.name === user.username.toUpperCase()).id,
          },
        }),
      ),
    );

    console.error('Seed successful');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await prisma.$disconnect();
  }
};

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
