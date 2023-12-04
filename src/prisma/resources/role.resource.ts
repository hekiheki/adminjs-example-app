import { menu } from '../../admin/index.js';
import { useEnvironmentVariableToDisableActions } from '../../admin/features/useEnvironmentVariableToDisableActions.js';
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
  features: [useEnvironmentVariableToDisableActions()],
  options: {
    navigation: menu.manager,
    properties: {
      id: {
        isVisible: { list: true, show: false, edit: false, filter: false },
      },
      name: {
        isVisible: { list: true, show: true, edit: true, filter: false },
        isTitle: true,
      },
      permissions: {
        isVisible: { list: true, show: true, edit: true, filter: false },
      },
    },
    actions: {
      list: {
        showFilter: false,
      },
    },
  },
});
