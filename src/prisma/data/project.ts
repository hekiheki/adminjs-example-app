import { client } from '../config.js';
import { ROLE } from '../../admin/constants/authUsers.js';

const convertFilter = (filters: any) => {
  return Object.entries(filters).reduce((where, [name, value]) => {
    if (name === 'name') {
      where[name] = {
        contains: value.toString(),
      };
    } else if (name === 'owner') {
      where.ownerId = Number(value);
    } else if (name === 'approvedBy') {
      where.approvedById = Number(value);
    } else if (name === 'tags') {
      where[name] = {
        some: {
          tagId: Number(value),
        },
      };
    }
    return where;
  }, {} as any);
};

export const findProjects = async (filters, params) => {
  const { limit = 10, offset = 0, sort = {}, status, currentAdmin } = params;
  const { direction, sortBy } = sort as { direction: 'asc' | 'desc'; sortBy: string };
  const where: any = convertFilter(filters);
  where.status = status;
  if (currentAdmin.roles[0] === ROLE.PUBLISHER) {
    where.ownerId = currentAdmin.id;
  }
  const results = await client.project.findMany({
    where,
    skip: offset,
    take: limit,
    orderBy: {
      [sortBy]: direction,
    },
    include: {
      tags: true,
    },
  });
  return results;
};

export const projectCount = async (filters, status, currentAdmin) => {
  const where: any = convertFilter(filters);
  where.status = status;
  if (currentAdmin.roles[0] === ROLE.PUBLISHER) {
    where.ownerId = currentAdmin.id;
  }
  const result = await client.project.count({
    where,
  });
  return result;
};

export const createProjectTags = async (projectId, tagId) => {
  await client.projectTags.create({
    data: {
      projectId,
      tagId,
    },
  });
};

export const deleteProjectTags = async (projectId: number) => {
  await client.projectTags.deleteMany({
    where: {
      projectId,
    },
  });
};
