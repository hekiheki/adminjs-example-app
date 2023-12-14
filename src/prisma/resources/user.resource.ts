import { NotFoundError, flat } from 'adminjs';
import { useEnvironmentVariableToDisableActions, usePasswordsFeature } from '../../admin/features/index.js';
import { MANY_TO_MANY_EDIT, MANY_TO_MANY_SHOW, MANY_TO_MANY_LIST } from '../../admin/components.bundler.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';
import { menu } from '../../admin/index.js';
import { AuthRoles, ROLE } from '../../admin/constants/authUsers.js';

export const getUserRolesHook = async (request, context) => {
  const { method, payload } = request;
  const { record, action } = context;
  if (!record) {
    throw new NotFoundError(
      [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
      'Action#handler',
    );
  }
  if (method !== 'post' || !payload || action.name !== 'new') {
    const userRoles = await client.userRoles.findMany({
      where: {
        userId: record.id(),
      },
      include: {
        role: true,
      },
    });

    record.params.roles = userRoles?.map(({ role }) => role) || [];
  }
  return request;
};

export const postUserRolesHook = async (request, context) => {
  const { method, payload } = request;
  const { record } = context;
  if (!record) {
    throw new NotFoundError(
      [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
      'Action#handler',
    );
  }
  if (method !== 'post' || !payload) {
    return request;
  }
  const roles = flat.unflatten(payload)?.roles || [];
  if (roles && roles.length) {
    const data = roles.map(({ id }) => {
      return {
        userId: record.id(),
        roleId: Number(id),
      };
    });
    await client.userRoles.deleteMany({
      where: {
        userId: record.id(),
      },
    });

    await client.userRoles.createMany({
      data,
    });
  }

  return request;
};

export const createUserRolesHook = async (response, request, context) => {
  const { method, payload } = request;
  if (method !== 'post' || !payload) {
    return request;
  }
  const userId = response.record?.params?.id;
  if (context.record.isValid() && userId) {
    const roles = flat.unflatten(payload)?.roles || [];
    if (roles && roles.length) {
      const data = roles.map(({ id }) => {
        return {
          userId,
          roleId: Number(id),
        };
      });
      await client.userRoles.createMany({
        data,
      });
    }
  }

  return response;
};

export const userBeforeHook = async (request, context) => {
  const { method, payload } = request;
  const { record } = context;
  if (!record) {
    throw new NotFoundError(
      [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
      'Action#handler',
    );
  }
  // if (method !== 'post' || !payload) {
  //   return request;
  // }
  // const roles = flat.unflatten(payload)?.roles || [];
  // if (roles && roles.length) {
  //   const data = roles.map(({ id }) => {
  //     return {
  //       userId: record.id(),
  //       roleId: Number(id),
  //     };
  //   });
  //   await client.userRoles.deleteMany({
  //     where: {
  //       userId: record.id(),
  //     },
  //   });

  //   await client.userRoles.createMany({
  //     data,
  //   });
  // }
  console.log(payload);

  return request;
};

export const CreateUserResource: ResourceFunction<{
  model: typeof dmmf.modelMap.User;
  client: typeof client;
}> = () => ({
  resource: {
    model: dmmf.modelMap.User,
    client,
  },
  features: [useEnvironmentVariableToDisableActions(), usePasswordsFeature()],
  options: {
    navigation: menu.manager,
    properties: {
      id: {
        isVisible: false,
      },
      avatarUrl: {
        isVisible: { list: false, show: true, edit: false, filter: false },
      },
      username: {
        isVisible: true,
        isSortable: true,
      },
      password: {
        isVisible: false,
      },
      nick: {
        isVisible: true,
        isTitle: true,
      },
      mobile: {
        isVisible: true,
        isDisabled: true,
      },
      roles: {
        reference: 'role',
        isVisible: {
          list: true,
          show: true,
          filter: false,
          edit: true,
        },
      },
      unionId: {
        isVisible: false,
      },
      openId: {
        isVisible: false,
      },
      status: {
        isVisible: false,
      },
      stateCode: {
        isVisible: false,
      },
    },
    actions: {
      new: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
        // isVisible: false,
        after: [createUserRolesHook],
      },
      edit: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
        // isVisible: false,
        before: [userBeforeHook],
      },
      delete: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
        // isVisible: false,
      },
      bulkDelete: {
        isAccessible: false,
        // isVisible: false,
      },
      show: {
        isAccessible: ({ currentAdmin }) =>
          currentAdmin && (currentAdmin.roles.includes(ROLE.DEVELOPER) || currentAdmin.roles.includes(ROLE.ADMIN)),
        // isVisible: false,
        // before: [getUserRolesHook],
      },
      list: {
        isAccessible: ({ currentAdmin }) =>
          currentAdmin && (currentAdmin.roles.includes(ROLE.DEVELOPER) || currentAdmin.roles.includes(ROLE.ADMIN)),
        after: async (response, request, context) => {
          response.records.forEach((record) => {
            record.params.password = '';
          });
          return response;
        },
      },
    },
  },
});
