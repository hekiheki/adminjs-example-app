import { flat, NotFoundError, populator, paramConverter } from 'adminjs';
import { menu } from '../../admin/index.js';
import { useUploadFeature } from '../../admin/features/index.js';
import { defaultValuesBeforeHook } from '../../admin/hooks/index.js';
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
      properties: {
        name: {
          type: 'string',
          isTitle: true,
          isVisible: true,
          position: 1,
        },
        department_1: {
          type: 'mixed',
          isTitle: true,
          position: 2,
        },
        department_2: {
          type: 'mixed',
          isTitle: true,
          position: 3,
        },
        id: {
          isVisible: false,
        },
        status: {
          type: 'string',
          isVisible: {
            list: true,
            edit: false,
            show: true,
            filter: false,
          },
          custom: {
            defaultValue: 'Pending',
          },
          isTitle: true,
          position: 4,
        },
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
          isAccessible: ({ currentAdmin }) => {
            return currentAdmin && currentAdmin.roles.includes(1) && status === 'Pending';
          },
          before: [defaultValuesBeforeHook],
        },
        list: {
          before: async (request, context) => {
            const { currentAdmin } = context;
            const { query = {} } = request;
            if (currentAdmin && currentAdmin.roles.includes(1)) {
              const newQuery = {
                ...query,
                ['filters.status']: status,
                ['filters.user']: currentAdmin?.id,
              };
              request.query = newQuery;
            } else {
              const newQuery = {
                ...query,
                ['filters.status']: status,
              };
              request.query = newQuery;
            }
            return request;
          },
          // after: [customAfter],
        },
        approved: {
          actionType: 'record',
          component: false,
          isAccessible: ({ currentAdmin }) => {
            return currentAdmin && currentAdmin.roles.includes(2) && status === 'Pending';
          },
          handler: async (request, response, context) => {
            const { record, resource, currentAdmin, h } = context;
            if (!record) {
              throw new NotFoundError(
                [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
                'Action#handler',
              );
            }

            const params = paramConverter.prepareParams({ ...request.payload, status: 'Approved' }, resource);

            const newRecord = await record.update(params, context);
            const [populatedRecord] = await populator([newRecord], context);

            console.log(request.payload, newRecord);

            // eslint-disable-next-line no-param-reassign
            context.record = populatedRecord;

            if (record.isValid()) {
              return {
                redirectUrl: h.resourceUrl({ resourceId: resource._decorated?.id() || resource.id() }),
                notice: {
                  message: 'successfullyUpdated',
                  type: 'success',
                },
                record: populatedRecord.toJSON(currentAdmin),
              };
            }
            const baseMessage = populatedRecord.baseError?.message || 'thereWereValidationErrors';
            return {
              record: populatedRecord.toJSON(currentAdmin),
              notice: {
                message: baseMessage,
                type: 'error',
              },
            };
          },
        },
      },
    },
  };
};
