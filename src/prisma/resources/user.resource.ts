import { menu } from '../../admin/index.js';
import { manyToManyReferencesAfterHook } from '../../admin/hooks/index.js';
import { useEnvironmentVariableToDisableActions, usePasswordsFeature } from '../../admin/features/index.js';
import { MANY_TO_MANY_EDIT, MANY_TO_MANY_LIST, MANY_TO_MANY_SHOW } from '../../admin/components.bundler.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';

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
        isVisible: { list: true, show: false, edit: false, filter: false },
      },
      username: {
        isVisible: true,
        isTitle: true,
      },
      password: {
        isVisible: false,
      },
      status: {
        isVisible: true,
        custom: {
          defaultValue: 'ACTIVE',
        },
      },
      roles: {
        name: 'Roles',
        reference: 'Role',
        isVisible: {
          list: true,
          show: true,
          filter: false,
          edit: true,
        },
        isArray: true,
        components: {
          show: MANY_TO_MANY_SHOW,
          edit: MANY_TO_MANY_EDIT,
          list: MANY_TO_MANY_LIST,
        },
        custom: {
          includeId: 'role',
          reference: 'UserRoles',
          resourceId: 'userId',
          referenceId: 'roleId',
        },
      },
      unionId: {
        isVisible: { list: true, show: true, edit: false, filter: false },
      },
      openId: {
        isVisible: { list: true, show: true, edit: false, filter: false },
      },
      nick: {
        isVisible: { list: true, show: true, edit: false, filter: false },
      },
      avatarUrl: {
        isVisible: { list: true, show: true, edit: false, filter: false },
      },
      mobile: {
        isVisible: { list: true, show: true, edit: false, filter: false },
      },
      stateCode: {
        isVisible: false,
      },
    },
    actions: {
      edit: {
        after: [manyToManyReferencesAfterHook],
      },
      show: {
        after: [manyToManyReferencesAfterHook],
      },
    },
  },
});
