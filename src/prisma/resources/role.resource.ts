import { menu } from '../../admin/index.js';
import { useEnvironmentVariableToDisableActions } from '../../admin/features/useEnvironmentVariableToDisableActions.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';

const ROLES = {
  1: '普通用户',
  2: '管理员',
  3: '超级管理员',
};

export const CreateRoleResource: ResourceFunction<{
  model: typeof dmmf.modelMap.Role;
  client: typeof client;
}> = () => ({
  resource: {
    model: dmmf.modelMap.Role,
    client,
  },
  features: [useEnvironmentVariableToDisableActions()],
  options: {
    navigation: false,
    properties: {
      id: {
        isVisible: { list: true, show: false, edit: false, filter: false },
        position: 1,
      },
      name: {
        isVisible: { list: true, show: true, edit: true, filter: false },
        isTitle: true,
        position: 2,
      },
      comment: {
        isVisible: false,
        position: 3,
      },
    },
    actions: {
      new: {
        isAccessible: false,
        isVisible: false,
      },
      edit: {
        isAccessible: false,
        isVisible: false,
      },
      delete: {
        isAccessible: false,
        isVisible: false,
      },
      list: {
        showFilter: false,
        isAccessible: false,
      },
      show: {
        after: async (response) => {
          const { record } = response;
          response.record.title = ROLES[record.id];
          return response;
        },
      },
      search: {
        after: async (response) => {
          response.records.forEach((record) => {
            record.title = ROLES[record.id];
          });
          return response;
        },
      },
    },
  },
});
