import { menu } from '../../admin/index.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';

export const CreateTagResource: ResourceFunction<{
  model: typeof dmmf.modelMap.Tag;
  client: typeof client;
}> = () => ({
  resource: {
    model: dmmf.modelMap.Tag,
    client,
  },
  features: [],
  options: {
    id: 'tag',
    navigation: menu.project,
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
      list: {
        showFilter: false,
        isAccessible: ({ currentAdmin }) =>
          currentAdmin && (currentAdmin.roles.includes(2) || currentAdmin.roles.includes(3)),
      },
    },
  },
});
