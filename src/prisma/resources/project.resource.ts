import { NotFoundError, populator, paramConverter, ValidationError, flat } from 'adminjs';
import { menu } from '../../admin/index.js';
import { useUploadFeature } from '../../admin/features/index.js';
import { MANY_TO_MANY_EDIT, MANY_TO_MANY_SHOW } from '../../admin/components.bundler.js';
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
          isRequired: true,
          position: 2,
        },
        department_2: {
          type: 'mixed',
          isRequired: true,
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
          position: 4,
        },
        tags: {
          reference: 'Tag',
          isVisible: {
            list: status === 'Approved',
            show: status === 'Approved',
            filter: status === 'Approved',
            edit: status === 'Approved',
          },
          isArray: false,
          components: {
            show: MANY_TO_MANY_SHOW,
            edit: MANY_TO_MANY_EDIT,
          },
          custom: {
            includeId: 'role',
            reference: 'UserRoles',
            resourceId: 'userId',
            referenceId: 'roleId',
            default: 'USER',
          },
        },
        owner: {
          isVisible: {
            list: status === 'Approved',
            edit: false,
            show: status === 'Approved',
            filter: status === 'Approved',
          },
          reference: 'user',
          position: 5,
        },
        approvedBy: {
          isVisible: {
            list: status === 'Approved',
            edit: false,
            show: status === 'Approved',
            filter: status === 'Approved',
          },
          reference: 'user',
          position: 6,
        },
        approvedAt: {
          isVisible: {
            list: false,
            edit: false,
            show: status === 'Approved',
            filter: status === 'Approved',
          },
          position: 7,
        },
        ...filePropertiesFor('department_1', { isArray: true }),
        ...filePropertiesFor('department_2', { isArray: true }),
      },
      actions: {
        edit: {
          isAccessible: false,
          isVisible: false,
        },
        delete: {
          isAccessible: ({ currentAdmin }) => {
            return currentAdmin && (currentAdmin.roles.includes(2) || currentAdmin.roles.includes(3));
          },
          // isVisible: false,
        },
        new: {
          isAccessible: ({ currentAdmin }) => {
            return currentAdmin && status === 'Pending';
          },
          before: async (request, context) => {
            const { currentAdmin } = context;
            request.payload.status = 'Pending';
            request.payload.owner = currentAdmin.id;
            return request;
          },
          after: async (response, request, context) => {
            const { record, resource, currentAdmin, h } = context;
            if (!record) {
              throw new NotFoundError(
                [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
                'Action#handler',
              );
            }
            const { department_1, department_2 } = flat.unflatten(record.params);
            if (!department_1 || !department_2) {
              await client.project.delete({
                where: {
                  id: record.params.id,
                },
              });
              return {
                record: record.toJSON(currentAdmin),
                notice: {
                  message: '文件不能为空',
                  type: 'error',
                },
              };
            }
            return response;
          },
        },
        list: {
          before: async (request, context) => {
            const { currentAdmin } = context;
            const { query = {} } = request;
            if (currentAdmin.roles.length === 1 && currentAdmin.roles.includes(1)) {
              const newQuery = {
                ...query,
                ['filters.status']: status,
                ['filters.owner']: currentAdmin?.id,
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
        },
        approved: {
          actionType: 'record',
          component: false,
          isAccessible: ({ currentAdmin }) => {
            return (
              currentAdmin && (currentAdmin.roles.includes(2) || currentAdmin.roles.includes(3)) && status === 'Pending'
            );
          },
          handler: async (request, response, context) => {
            const { record, resource, currentAdmin, h } = context;
            if (!record) {
              throw new NotFoundError(
                [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
                'Action#handler',
              );
            }
            request.payload.status = 'Approved';
            request.payload.approvedBy = currentAdmin.id;
            request.payload.approvedAt = new Date();
            const params = paramConverter.prepareParams(request.payload ?? {}, resource);

            const newRecord = await record.update(params, context);
            const [populatedRecord] = await populator([newRecord], context);

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
