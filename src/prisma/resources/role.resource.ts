import { menu } from '../../admin/index.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';

export const CreateRoleResource: ResourceFunction<{
  model: typeof dmmf.modelMap.Role;
  client: typeof client;
}> = () => ({
  resource: {
    model: dmmf.modelMap.Role,
    client,
  },
  features: [],
  options: {
    navigation: menu.manager,
    id: 'role',
    properties: {
      id: {
        isVisible: true,
      },
      name: {
        isVisible: true,
        isTitle: true,
      },
      comment: {
        isVisible: false,
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
        isAccessible: false,
        showFilter: false,
        isVisible: false,
      },
      show: {
        isVisible: false,
      },
      search: {
        isVisible: false,
      },
    },
  },
});
