import { useEnvironmentVariableToDisableActions } from '../../admin/features/useEnvironmentVariableToDisableActions.js';
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
  features: [useEnvironmentVariableToDisableActions()],
  options: {
    navigation: menu.manager,
    // properties: {
    //   id: {
    //     isVisible: { list: true, show: false, edit: false, filter: false },
    //   },
    //   userId: {
    //     isVisible: true,
    //     reference: 'User',
    //   },
    //   roleId: {
    //     isVisible: true,
    //     reference: 'Role',
    //   },
    // },
  },
});
