import { Roles } from '@prisma/client';

import { client } from '../config.js';

export interface User {
  id: number;
  username: string;
  nick?: string;
  mobile?: string;
  status?: string;
  avatarUrl?: string;
  password?: string;
  stateCode?: string;
  roles: number[];
}

export const findUser = async (fields, select) => {
  const user = await client.user.findFirst({
    where: { ...fields },
    select: { ...select },
  });
  return user;
};

export const createUser = async (data) => {
  const newUser = await client.user.create({
    data,
  });

  const defaultRole = await client.role.findFirst({
    where: {
      name: Roles.PUBLISHER,
    },
  });

  await client.userRoles.create({
    data: {
      roleId: defaultRole.id,
      userId: newUser.id,
    },
  });
  return {
    ...newUser,
    roles: [defaultRole.id],
  };
};
