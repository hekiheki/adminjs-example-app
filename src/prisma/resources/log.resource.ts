import { createLoggerResource } from '@adminjs/logger';
import { menu } from '../../admin/index.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { useLoggerFeature } from '../../admin/features/index.js';
import { client, dmmf } from '../config.js';

export const CreateLogResource: ResourceFunction<{
  model: typeof dmmf.modelMap.Log;
  client: typeof client;
}> = () => ({
  resource: {
    model: dmmf.modelMap.Log,
    client,
  },
  features: [useLoggerFeature()],
  options: {
    navigation: menu.manager,
  },
});
