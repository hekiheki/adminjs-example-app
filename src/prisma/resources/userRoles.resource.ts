import { NotFoundError, ValidationError, paramConverter, populator } from 'adminjs';
import { useEnvironmentVariableToDisableActions, usePasswordsFeature } from '../../admin/features/index.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';
import { menu } from '../../admin/index.js';
import { THUMB } from '../../admin/components.bundler.js';
import { AuthRoles } from '../../admin/constants/authUsers.js';

const getUserInfoById = async (id) => {
  const userInfo = await client.user.findFirst({
    where: {
      id,
    },
    select: {
      nick: true,
      mobile: true,
      avatarUrl: true,
      username: true,
    },
  });
  return userInfo;
};

const validateForm = async (request, context) => {
  const { username, password, role } = request.payload;
  const errors: any = {};

  // We are doing validations and assigning errors to "errors" object
  if (!username) {
    errors.username = {
      message: '用户名不能为空',
    };
  }

  if (!password) {
    errors.newPassword = {
      message: '密码不能为空',
    };
  }

  if (!role) {
    errors.role = {
      message: '用户权限不能为空',
    };
  }

  const isUsernameExist = await client.user.findFirst({
    where: {
      username,
    },
  });

  if (isUsernameExist) {
    errors.username = {
      message: '用户名已存在',
    };
  }

  // We throw AdminJS ValidationError if there are errors in the payload
  if (Object.keys(errors).length) {
    throw new ValidationError(errors);
  }

  const newUser = await client.user.create({
    data: {
      username,
      password,
      nick: username,
    },
  });
  const payload = {
    user: newUser.id,
    role,
  };
  request.payload = payload;
  return request;
};

export const CreateUserRolesResource: ResourceFunction<{
  model: typeof dmmf.modelMap.UserRoles;
  client: typeof client;
}> = () => ({
  resource: {
    model: dmmf.modelMap.UserRoles,
    client,
  },
  features: [usePasswordsFeature()],
  options: {
    navigation: menu.manager,
    properties: {
      id: {
        isVisible: false,
      },
      avatarUrl: {
        isVisible: { list: false, show: true, edit: false, filter: false },
        isDisabled: true,
        components: {
          show: THUMB,
        },
        position: 1,
      },
      user: {
        isVisible: { list: true, show: true, edit: false, filter: true },
        position: 2,
        // isTitle: true,
        reference: 'user',
      },
      role: {
        isVisible: { list: false, show: false, edit: true, filter: true },
        position: 4,
        reference: 'role',
      },
      userRole: {
        isVisible: { list: true, show: true, edit: false, filter: false },
        type: 'string',
        position: 4,
      },
      username: {
        isVisible: { list: false, show: false, edit: true, filter: false },
        type: 'string',
        position: 2,
        isRequired: true,
      },
      password: {
        isVisible: false,
        position: 3,
      },
      newPassword: {
        isRequired: true,
        position: 3,
      },
      nick: {
        type: 'string',
        isVisible: { list: true, show: true, edit: true, filter: false },
        position: 6,
      },
      mobile: {
        type: 'string',
        isVisible: { list: true, show: true, edit: false, filter: false },
        position: 6,
      },
    },
    actions: {
      list: {
        isAccessible: false,
        after: async (response, request, context) => {
          const { records } = response;
          await Promise.all(
            records.map(async (record) => {
              const userId = record.params.user;
              const roleId = record.params.role;
              const userInfo = await getUserInfoById(userId);
              record.params.mobile = userInfo.mobile;
              record.params.userRole = AuthRoles[roleId - 1].title;
              return record;
            }),
          );
          return response;
        },
      },
      new: {
        isAccessible: false,
        before: [validateForm],
      },
      show: {
        isAccessible: false,
        after: async (response, request, context) => {
          const { record } = response;
          if (!record) {
            throw new NotFoundError(
              [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
              'Action#handler',
            );
          }
          // const roles = await getRoles();
          const roleId = record.params.role;
          const userId = record.params.user;
          const userInfo = await getUserInfoById(userId);
          // record.params.username = userInfo.nick || userInfo.username;
          record.params.mobile = userInfo.mobile;
          record.params.avatarUrl = userInfo.avatarUrl;
          record.params.userRole = AuthRoles[roleId - 1].title;
          return response;
        },
      },
      edit: {
        isAccessible: false,
      },
      delete: {
        isAccessible: false,
        after: async (response, request, context) => {
          const { record } = response;
          if (!record) {
            throw new NotFoundError(
              [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
              'Action#handler',
            );
          }
          const userId = record.params.user;
          await client.user.delete({
            where: {
              id: userId,
            },
          });
          return response;
        },
      },
    },
  },
});
