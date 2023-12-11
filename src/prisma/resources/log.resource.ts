import { createLoggerResource } from '@adminjs/logger';
import { componentLoader } from '../../admin/components.bundler.js';
import { menu } from '../../admin/index.js';
import { client, dmmf } from '../config.js';

export const CreateLogResource = () =>
  createLoggerResource({
    componentLoader,
    resource: {
      model: dmmf.modelMap.Log,
      client,
    },
    featureOptions: {
      componentLoader,
      propertiesMapping: {
        user: 'userId',
      },
      resourceOptions: {
        navigation: menu.manager,
        actions: {
          list: {
            isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(3),
          },
        },
      },
    },
  });
