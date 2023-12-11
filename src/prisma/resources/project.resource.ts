import { flat } from 'adminjs';
import { menu } from '../../admin/index.js';
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
    comment: {
      type: 'string',
      isVisible: false,
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

export const CreateProjectResource = (status = 'Pending') => {
  return {
    resource: {
      model: dmmf.modelMap.Project,
      client,
    },
    features: [useUploadFeature('department_1', true), useUploadFeature('department_2', true)],
    options: {
      id: status,
      navigation: menu.project,
      // href: ({ h, resource }) => {
      //   return h.resourceActionUrl({
      //     resourceId: resource.decorate().id(),
      //     actionName: 'list',
      //     search: `?filters.status=${status}`,
      //   });
      // },
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
        // status: {
        //   type: 'string',
        //   isVisible: {
        //     list: true,
        //     edit: false,
        //     show: true,
        //     filter: false,
        //   },
        // },
        ...fileProperties(),
        ...filePropertiesFor('department_1', { isArray: true }),
        ...filePropertiesFor('department_2', { isArray: true }),
      },
      actions: {
        edit: {
          isAccessible: false,
          isVisible: false,
        },
        new: {
          after: async (response, request, context) => {
            console.log(request.query);

            return response;
          },
        },
        list: {
          before: async (request, context) => {
            const { query = {} } = request;
            const newQuery = {
              ...query,
              ['filters.status']: status,
            };
            request.query = newQuery;
            return request;
          },
          // after: [customAfter],
        },
      },
    },
  };
};
