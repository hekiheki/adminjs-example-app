import { menu } from '../../admin/index.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { useUploadFeature } from '../../admin/features/index.js';
import { client, dmmf } from '../config.js';

const fileProperties = (options = {}) =>
  ({
    bucket: {
      type: 'string',
      isVisible: false,
      ...options,
    },
    mime: {
      type: 'string',
      isVisible: false,
      ...options,
    },
    key: {
      type: 'string',
      isVisible: false,
      ...options,
    },
    size: {
      type: 'number',
      isVisible: false,
      ...options,
    },
  } as const);

const filePropertiesFor = (name, options = {}) => {
  const properties = fileProperties(options);
  return Object.keys(properties).reduce(
    (memo, key) => ({
      ...memo,
      [`${name}.${key}`]: properties[key],
    }),
    {},
  );
};

export const CreateProjectResource: ResourceFunction<{
  model: typeof dmmf.modelMap.Project;
  client: typeof client;
}> = () => ({
  resource: {
    model: dmmf.modelMap.Project,
    client,
  },
  features: [useUploadFeature('department_1', true), useUploadFeature('department_2', true)],
  options: {
    navigation: menu.project,
    // listProperties: ['id', 's3Key', 'bucket', 'path', 'name'],
    properties: {
      department_1: {
        type: 'mixed',
      },
      department_2: {
        type: 'mixed',
      },
      id: {
        isVisible: false,
      },
      comment: {
        isVisible: false,
      },
      ...fileProperties(),
      ...filePropertiesFor('department_1', { isArray: true }),
      ...filePropertiesFor('department_2', { isArray: true }),
    },
  },
});
