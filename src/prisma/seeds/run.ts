import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { AuthUsers, AuthRoles } from '../../admin/constants/authUsers.js';

dotenv.config({
  path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

const prisma = new PrismaClient();

const run = async () => {
  try {
    const initUserData = await Promise.all(
      AuthUsers.map(async (user) => {
        return {
          ...user,
          password: await argon2.hash(user.password),
        };
      }),
    );

    await prisma.$connect();

    await prisma.$transaction(
      AuthRoles.map(({ name, comment }) =>
        prisma.role.create({
          data: { name, comment },
        }),
      ),
    );

    await prisma.$transaction(
      initUserData.map(({ username, password }) =>
        prisma.user.create({
          data: {
            username,
            password,
            nick: username,
          },
        }),
      ),
    );

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
