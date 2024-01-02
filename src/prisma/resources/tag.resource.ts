import { menu } from '../../admin/index.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';
import { ROLE } from '../../admin/constants/authUsers.js';
import { useLoggerFeature } from '../../admin/features/index.js';

export const CreateTagResource: ResourceFunction<{
  model: typeof dmmf.modelMap.Tag;
  client: typeof client;
}> = () => ({
  resource: {
    model: dmmf.modelMap.Tag,
    client,
  },
  features: [useLoggerFeature()],
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
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles[0] >= ROLE.APPROVER,
      },
      new: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles[0] >= ROLE.APPROVER,
      },
      show: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles[0] >= ROLE.APPROVER,
      },
      edit: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles[0] >= ROLE.APPROVER,
      },
      delete: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles[0] >= ROLE.APPROVER,
      },
      bulkDelete: {
        isAccessible: false,
        isVisible: false,
      },
    },
  },
});
