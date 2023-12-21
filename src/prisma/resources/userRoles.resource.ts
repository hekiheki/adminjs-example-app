import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';
import { menu } from '../../admin/index.js';

export const CreateUserRolesResource: ResourceFunction<{
  model: typeof dmmf.modelMap.UserRoles;
  client: typeof client;
}> = () => ({
  resource: {
    model: dmmf.modelMap.UserRoles,
    client,
  },
  options: {
    id: 'userRoles',
    navigation: menu.manager,
    properties: {
      id: {
        isVisible: false,
      },
      user: {
        reference: 'user',
      },
      role: {
        reference: 'role',
      },
    },
    actions: {
      list: {
        isAccessible: false,
        isVisible: false,
      },
      new: {
        isAccessible: false,
        isVisible: false,
      },
      show: {
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
    },
  },
});
