import { menu } from '../../admin/index.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';

export const CreateProjectTagsResource: ResourceFunction<{
  model: typeof dmmf.modelMap.ProjectTags;
  client: typeof client;
}> = () => ({
  resource: {
    model: dmmf.modelMap.ProjectTags,
    client,
  },
  features: [],
  options: {
    id: 'projectTags',
    navigation: menu.project,
    properties: {
      id: {
        isVisible: false,
      },
      project: {
        isVisible: true,
        position: 1,
        reference: 'approved',
      },
      tag: {
        isVisible: true,
        position: 2,
        reference: 'tag',
      },
    },
    actions: {
      list: {
        isAccessible: false,
      },
    },
  },
});
