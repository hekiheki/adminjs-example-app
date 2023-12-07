import { menu } from '../../admin/index.js';
import {
  manyToManyReferencesAfterHook,
  getManyToManyReferencesValuesAfterHook,
  postManyToManyReferencesValuesAfterHook,
} from '../../admin/hooks/index.js';
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
        isId: true,
        position: 1,
      },
      username: {
        isVisible: true,
        isTitle: true,
        position: 2,
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
          list: false,
          show: true,
          filter: false,
          edit: true,
        },
        isArray: false,
        components: {
          show: MANY_TO_MANY_SHOW,
          edit: MANY_TO_MANY_EDIT,
        },
        custom: {
          includeId: 'role',
          reference: 'UserRoles',
          resourceId: 'userId',
          referenceId: 'roleId',
          default: 'USER',
        },
      },
      unionId: {
        isVisible: { list: false, show: true, edit: false, filter: false },
      },
      openId: {
        isVisible: { list: false, show: true, edit: false, filter: false },
      },
      nick: {
        isVisible: { list: true, show: true, edit: false, filter: false },
        isTitle: true,
        position: 4,
      },
      avatarUrl: {
        isVisible: { list: false, show: true, edit: false, filter: false },
      },
      mobile: {
        isVisible: { list: true, show: true, edit: false, filter: false },
        isTitle: true,
        position: 5,
      },
      stateCode: {
        isVisible: false,
      },
    },
    actions: {
      new: {
        after: [postManyToManyReferencesValuesAfterHook],
      },
      edit: {
        after: [getManyToManyReferencesValuesAfterHook, postManyToManyReferencesValuesAfterHook],
      },
      show: {
        after: [getManyToManyReferencesValuesAfterHook],
      },
    },
  },
});
