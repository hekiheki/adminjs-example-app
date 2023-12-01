import { menu } from '../../admin/index.js';
import { useEnvironmentVariableToDisableActions } from '../../admin/features/useEnvironmentVariableToDisableActions.js';
import { usePasswordsFeature } from '../../admin/features/usePasswordsFeature.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { ROLES_LIST } from '../../admin/components.bundler.js';
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
    navigation: menu.user,
    properties: {
      id: {
        isVisible: { list: true, show: false, edit: false, filter: false },
      },
      username: {
        isVisible: { list: true, show: true, edit: true, filter: true },
        isTitle: true,
      },
      password: {
        isVisible: { list: false, show: false, edit: false, filter: false },
      },
      status: {
        isVisible: { list: true, show: true, edit: true, filter: true },
      },
      roles: {
        isVisible: { list: true, show: true, edit: true, filter: true },
        components: {
          edit: ROLES_LIST,
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
        isVisible: { list: false, show: false, edit: false, filter: false },
      },
    },
    actions: {
      edit: {
        isAccessible: true,
        isVisible: true,
        before: async (request) => {
          console.log('request', request);
          return request;
        },
        after: async (response) => {
          console.log('response', response);
          return response;
        },
      },
    },
  },
});
