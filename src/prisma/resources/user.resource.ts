import { NotFoundError, flat } from 'adminjs';
import { useEnvironmentVariableToDisableActions, usePasswordsFeature } from '../../admin/features/index.js';
import { MANY_TO_MANY_EDIT, MANY_TO_MANY_SHOW, MANY_TO_MANY_LIST } from '../../admin/components.bundler.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';

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
    navigation: false,
    properties: {
      id: {
        isVisible: { list: true, show: false, edit: false, filter: false },
        isId: true,
        position: 1,
        // isSortable: true,
      },
      username: {
        isVisible: true,
        isTitle: true,
        position: 2,
        isSortable: true,
      },
      password: {
        isVisible: false,
      },
      status: {
        isVisible: false,
        // isTitle: true,
        // position: 6,
      },
      roles: {
        reference: 'Role',
        isVisible: {
          list: true,
          show: true,
          filter: false,
          edit: true,
        },
        isArray: false,
        components: {
          show: MANY_TO_MANY_SHOW,
          edit: MANY_TO_MANY_EDIT,
          list: MANY_TO_MANY_LIST,
        },
      },
      unionId: {
        isVisible: false,
      },
      openId: {
        isVisible: false,
      },
      nick: {
        isVisible: { list: true, show: true, edit: false, filter: true },
        isTitle: true,
        position: 4,
        isSortable: true,
      },
      avatarUrl: {
        isVisible: { list: false, show: true, edit: false, filter: false },
      },
      mobile: {
        isVisible: { list: true, show: true, edit: false, filter: true },
        isTitle: true,
        position: 5,
      },
      stateCode: {
        isVisible: false,
      },
    },
    actions: {
      new: {
        isAccessible: false,
        after: [createUserRolesHook],
      },
      edit: {
        isAccessible: false,
        before: [getUserRolesHook, postUserRolesHook],
      },
      show: {
        isAccessible: false,
        before: [getUserRolesHook],
      },
      list: {
        isAccessible: false,
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
