import { menu } from '../../admin/index.js';
import { useEnvironmentVariableToDisableActions } from '../../admin/features/useEnvironmentVariableToDisableActions.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';
import { AuthRoles, ROLE } from '../../admin/constants/authUsers.js';

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
    navigation: menu.manager,
    id: 'role',
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
      bulkDelete: {
        isAccessible: false,
        isVisible: false,
      },
      list: {
        showFilter: false,
        isVisible: false,
        isAccessible: ({ currentAdmin }) =>
          currentAdmin && (currentAdmin.roles.includes(ROLE.DEVELOPER) || currentAdmin.roles.includes(ROLE.ADMIN)),
      },
      show: {
        isVisible: false,
        after: async (response) => {
          const { record } = response;
          record.title = AuthRoles.find((role) => role.name === record.title)?.title;
          return response;
        },
      },
      search: {
        after: async (response) => {
          response.records.map((record) => {
            record.title = AuthRoles.find((role) => role.name === record.title)?.title;
            return record;
          });
          return response;
        },
      },
    },
  },
});
