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

export const findUserRoles = async (userId: number) => {
  const { role } = await client.userRoles.findFirst({
    where: { userId },
    include: {
      role: true,
    },
  });
  return role;
};

export const deleteUserRoles = async (userId: number) => {
  await client.userRoles.deleteMany({
    where: {
      userId,
    },
  });
};

export const updateUserRoles = async (userId: number, roleId: number) => {
  await deleteUserRoles(userId);

  await client.userRoles.create({
    data: {
      userId,
      roleId,
    },
  });
};

export const createUserRoles = async (userId: number, roleId: number) => {
  await client.userRoles.create({
    data: {
      userId,
      roleId,
    },
  });
};

const convertFilter = (filters: any) => {
  return Object.entries(filters).reduce((where, [name, value]) => {
    if (['username', 'nick', 'mobile'].includes(name)) {
      where[name] = {
        contains: value.toString(),
      };
    } else if (name === 'roles') {
      where[name] = {
        some: {
          roleId: Number(value),
        },
      };
    }
    return where;
  }, {});
};

export const findUsers = async (filters, params) => {
  const { limit = 10, offset = 0, sort = {} } = params;
  const { direction, sortBy } = sort as { direction: 'asc' | 'desc'; sortBy: string };
  const results = await client.user.findMany({
    where: convertFilter(filters),
    skip: offset,
    take: limit,
    orderBy: {
      [sortBy]: direction,
    },
    include: {
      roles: true,
    },
  });
  return results;
};

export const userCount = async (filters) => {
  const result = await client.user.count({
    where: convertFilter(filters),
  });
  return result;
};
