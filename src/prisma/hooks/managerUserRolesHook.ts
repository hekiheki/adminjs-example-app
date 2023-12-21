import { client } from '../config.js';

const formattedRecordParams = async (record, action = '') => {
  const { params, id } = record;

  const userRoles = await client.userRoles.findMany({
    where: {
      userId: id,
    },
    include: {
      role: true,
    },
  });

  if (userRoles && userRoles.length) {
    const roleId = userRoles[0].roleId;
    const roleTitle = userRoles[0].role.name;
    params.roles = action === 'edit' ? roleId : roleTitle;
  }
  params.password = null;
  return params;
};

export const saveUserRoles = async (response, request, context) => {
  const { record = {} } = response;
  const { payload = {}, method } = request;
  const { id: userId } = record;

  if (method !== 'post') {
    return response;
  }

  if (context.action.name === 'edit') {
    await client.userRoles.deleteMany({
      where: {
        userId,
      },
    });
  }

  const roleId = payload.roles ? Number(payload.roles) : null;
  await client.userRoles.create({
    data: {
      userId: record.id,
      roleId,
    },
  });

  return response;
};

export const getUserRoles = async (response, request, context) => {
  const { record } = response;
  const { method } = request;

  if (method === 'get') {
    record.params = await formattedRecordParams(record, context.action.name);
  }

  return response;
};

export const getUsersRoles = async (response) => {
  const { records } = response;

  await Promise.all(
    records.map(async (record) => {
      record.params = await formattedRecordParams(record);
      return record;
    }),
  );

  return response;
};

export const deleteUserRoles = async (request) => {
  const { params = {} } = request;
  const userId = Number(params.recordId);
  await client.userRoles.deleteMany({
    where: {
      userId,
    },
  });

  return request;
};
