import { menu } from '../../admin/index.js';
import { useEnvironmentVariableToDisableActions } from '../../admin/features/useEnvironmentVariableToDisableActions.js';
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
  features: [useEnvironmentVariableToDisableActions()],
  options: {
    navigation: menu.project,
    properties: {},
    actions: {
      list: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(2),
      },
    },
  },
});
