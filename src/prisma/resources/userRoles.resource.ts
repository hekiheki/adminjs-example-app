import { NotFoundError, ValidationError, paramConverter, populator } from 'adminjs';
import { useEnvironmentVariableToDisableActions, usePasswordsFeature } from '../../admin/features/index.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';
import { menu } from '../../admin/index.js';
import { THUMB } from '../../admin/components.bundler.js';

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

const ROLES = {
  1: '普通用户',
  2: '管理员',
  3: '超级管理员',
  4: '开发人员',
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
  features: [useEnvironmentVariableToDisableActions(), usePasswordsFeature()],
  options: {
    id: 'user',
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
        isTitle: true,
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
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(3),
        after: async (response, request, context) => {
          const { records } = response;
          await Promise.all(
            records.map(async (record) => {
              const userId = record.params.user;
              const roleId = record.params.role;
              const userInfo = await getUserInfoById(userId);
              record.params.mobile = userInfo.mobile;
              record.params.userRole = ROLES[roleId];
              return record;
            }),
          );
          return response;
        },
      },
      new: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(3),
        before: [validateForm],
      },
      show: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(3),
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
          record.params.userRole = ROLES[roleId];
          return response;
        },
      },
      edit: {
        isAccessible: false,
      },
      delete: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(3),
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
      managerRole: {
        actionType: 'record',
        component: false,
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(3),
        handler: async (request, response, context) => {
          const { record, resource, currentAdmin, h } = context;
          if (!record) {
            throw new NotFoundError(
              [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
              'Action#handler',
            );
          }

          if (request.method === 'get') {
            return { record: record.toJSON(currentAdmin) };
          }
          const params = paramConverter.prepareParams(request.payload ?? {}, resource);

          const newRecord = await record.update(params, context);
          const [populatedRecord] = await populator([newRecord], context);

          // eslint-disable-next-line no-param-reassign
          context.record = populatedRecord;

          if (record.isValid()) {
            return {
              redirectUrl: h.resourceUrl({ resourceId: resource._decorated?.id() || resource.id() }),
              notice: {
                message: 'successfullyUpdated',
                type: 'success',
              },
              record: populatedRecord.toJSON(currentAdmin),
            };
          }
          const baseMessage = populatedRecord.baseError?.message || 'thereWereValidationErrors';
          return {
            record: populatedRecord.toJSON(currentAdmin),
            notice: {
              message: baseMessage,
              type: 'error',
            },
          };
        },
      },
    },
  },
});
