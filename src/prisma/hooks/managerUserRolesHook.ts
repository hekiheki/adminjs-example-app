import { ValidationError } from 'adminjs';
import { client } from '../config.js';
import { AuthRoles } from '../../admin/constants/authUsers.js';

type ErrorMessage = Record<string, { message: string }>;

const validatePassword = (password, action) => {
  if (!password && action === 'new') {
    return '密码不能为空';
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  if (!passwordRegex.test(password)) {
    return '密码必须满足以下条件：至少8个字符长，包含至少一个大写字母、一个小写字母、一个数字和一个特殊字符（!@#$%^&*）';
  }
  return null;
};

const validateUsername = async (username, action) => {
  if (!username) {
    return '用户名不能为空';
  }

  if (action === 'new') {
    const isUsernameExist = await client.user.findFirst({
      where: {
        username,
      },
    });

    return isUsernameExist ? '用户名已存在' : null;
  }
  return null;
};

const formattedRecordParams = async (record, action = '') => {
  const { params, id } = record;

  const userInfo = await client.user.findFirst({
    where: {
      id,
    },
    include: {
      roles: true,
    },
  });
  if (userInfo.roles && userInfo.roles.length) {
    const roleId = userInfo.roles[0].roleId;
    const roleTitle = AuthRoles.find((role) => role.id === roleId).title;
    params.roles = action === 'edit' ? roleId : roleTitle;
  }
  params.password = '';
  return params;
};

export const validateUserForm = async (request, context) => {
  const { payload = {}, method } = request;
  const { username, password, roles, nick } = payload;
  const errors: ErrorMessage = {};

  if (method !== 'post') return request;

  const usernameMessage = await validateUsername(username, context.action.name);

  if (usernameMessage) {
    errors.username = {
      message: usernameMessage,
    };
  }

  if (!nick) {
    errors.nick = {
      message: '姓名不能为空',
    };
  }

  if (!roles) {
    errors.roles = {
      message: '请选择用户权限',
    };
  }

  if (!password && context.action.name === 'new') {
    errors.newPassword = {
      message: '密码不能为空',
    };
  }

  // We throw AdminJS ValidationError if there are errors in the payload
  if (Object.keys(errors).length) {
    throw new ValidationError(errors);
  }
  return request;
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
