import { menu } from '../../admin/index.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';
import { ROLE } from '../../admin/constants/authUsers.js';

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
        isVisible: false,
        position: 1,
      },
      name: {
        isVisible: true,
        isTitle: true,
        position: 2,
      },
      comment: {
        isVisible: { list: true, show: true, edit: true, filter: false },
        position: 3,
      },
    },
    actions: {
      list: {
        isAccessible: ({ currentAdmin }) =>
          currentAdmin && (currentAdmin.roles.includes(ROLE.APPROVER) || currentAdmin.roles.includes(ROLE.ADMIN)),
      },
      new: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.APPROVER),
      },
      show: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.APPROVER),
      },
      edit: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.APPROVER),
      },
      delete: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.APPROVER),
      },
      bulkDelete: {
        isAccessible: false,
        isVisible: false,
      },
    },
  },
});
