import dotenv from 'dotenv';
dotenv.config({
  path: `${process.cwd()}/.env`,
});

import { PrismaClient } from '@prisma/client';
import { users, roles } from './data/index.js';

const userCount = 4;

const run = async () => {
  const prisma = new PrismaClient();
  await prisma.$connect();

  await prisma.$transaction(
    prisma.user.create({
      data: {
        username: 'admin',
        password: '123456',
      },
    }),
  );

  await prisma.$transaction(users(userCount).map((user) => prisma.user.create({ data: user })));

  await prisma.$transaction(roles().map((role) => prisma.role.create({ data: role })));
};

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
