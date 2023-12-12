import { menu } from '../../admin/index.js';
import { useEnvironmentVariableToDisableActions } from '../../admin/features/useEnvironmentVariableToDisableActions.js';
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
  features: [useEnvironmentVariableToDisableActions()],
  options: {
    navigation: menu.project,
    properties: {},
    actions: {
      list: {
        showFilter: false,
        isAccessible: ({ currentAdmin }) =>
          currentAdmin && (currentAdmin.roles.includes(2) || currentAdmin.roles.includes(3)),
      },
    },
  },
});
