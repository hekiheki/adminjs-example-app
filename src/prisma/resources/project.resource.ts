import { NotFoundError, populator, paramConverter, flat, ActionQueryParameters, ValidationError } from 'adminjs';
import { menu, ProjectStatus } from '../../admin/index.js';
import { ApproveComponent } from '../../admin/components.bundler.js';
import { useUploadFeature, useLoggerFeature } from '../../admin/features/index.js';
import { client, dmmf } from '../config.js';
import { ROLE } from '../../admin/constants/authUsers.js';
import { findProjects, projectCount, createProjectTags, deleteProjectTags } from '../data/project.js';
import sortSetter from '../utils/sort.js';

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

export const CreateProjectResource = (status = ProjectStatus.Pending) => {
  return {
    resource: {
      model: dmmf.modelMap.Project,
      client,
    },
    features: [
      useUploadFeature('department_1', true),
      useUploadFeature('department_2', true),
      useUploadFeature('department_3', true),
      useLoggerFeature(),
    ],
    options: {
      id: status.toLocaleLowerCase(),
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
        department_3: {
          type: 'mixed',
          isRequired: true,
          position: 4,
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
          position: 5,
        },
        owner: {
          isVisible: {
            list: true,
            edit: false,
            show: true,
            filter: true,
          },
          reference: 'user',
          position: 6,
        },
        approvedBy: {
          isVisible: {
            list: status === ProjectStatus.Approved,
            edit: false,
            show: status === ProjectStatus.Approved,
            filter: status === ProjectStatus.Approved,
          },
          reference: 'user',
          position: 7,
        },
        approvedAt: {
          isVisible: {
            list: false,
            edit: false,
            show: status === ProjectStatus.Approved,
            filter: status === ProjectStatus.Approved,
          },
          position: 8,
        },
        createdAt: {
          isVisible: {
            list: false,
            edit: false,
            show: true,
            filter: status === ProjectStatus.Pending,
          },
          position: 9,
        },
        updatedAt: {
          isVisible: {
            list: false,
            edit: false,
            show: false,
            filter: false,
          },
        },
        tags: {
          reference: 'tag',
          isVisible: {
            list: status === ProjectStatus.Approved,
            show: true,
            filter: status === ProjectStatus.Approved,
            edit: false,
          },
          isArray: false,
          custom: {
            isMultiple: false,
          },
          position: 10,
        },
        comment: {
          isVisible: {
            list: true,
            edit: true,
            show: true,
            filter: false,
          },
          position: 11,
        },
        ...filePropertiesFor('department_1', { isArray: true }),
        ...filePropertiesFor('department_2', { isArray: true }),
        ...filePropertiesFor('department_3', { isArray: true }),
      },
      actions: {
        delete: {
          isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles[0] >= ROLE.APPROVER,
          isVisible: true,
          handler: async (request, _response, context) => {
            const { record, resource, currentAdmin, h } = context;
  
            if (!request.params.recordId || !record) {
              throw new NotFoundError(['You have to pass "recordId" to Delete Action'].join('\n'), 'Action#handler');
            }
  
            if (request.method === 'get') {
              return {
                record: record.toJSON(context.currentAdmin),
              };
            }
  
            try {
              await deleteProjectTags(Number(record.id()));
              await resource.delete(request.params.recordId, context);
            } catch (error) {
              if (error instanceof ValidationError) {
                const baseMessage = error.baseError?.message || 'thereWereValidationErrors';
                return {
                  record: record.toJSON(currentAdmin),
                  notice: {
                    message: baseMessage,
                    type: 'error',
                  },
                };
              }
              throw error;
            }
  
            return {
              record: record.toJSON(currentAdmin),
              redirectUrl: h.resourceUrl({ resourceId: resource._decorated?.id() || resource.id() }),
              notice: {
                message: 'successfullyDeleted',
                type: 'success',
              },
            };
          },
        },
        bulkDelete: {
          isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles[0] >= ROLE.APPROVER,
          isVisible: false,
        },
        new: {
          isAccessible: ({ currentAdmin }) => {
            return currentAdmin && status === ProjectStatus.Pending;
          },
          before: async (request, context) => {
            const { currentAdmin } = context;
            request.payload.status = ProjectStatus.Pending;
            request.payload.owner = currentAdmin.id;
            return request;
          },
          after: async (response, request, context) => {
            const { record, currentAdmin } = context;
            if (!record) {
              throw new NotFoundError(
                [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
                'Action#handler',
              );
            }
            const { department_1, department_2, department_3 } = flat.unflatten(record.params);
            const errors: string[] = [];
            if (!department_1) {
              errors.push('请上传部门1文件');
            }
            if (!department_2) {
              errors.push('请上传部门2文件');
            }
            if (!department_3) {
              errors.push('请上传部门3文件');
            }
            if (errors.length > 0) {
              await client.project.delete({
                where: {
                  id: record.params.id,
                },
              });
              return {
                record: record.toJSON(currentAdmin),
                notice: {
                  message: errors.join('\n'),
                  type: 'error',
                },
              };
            }
            return response;
          },
        },
        list: {
          handler: async (request, response, context) => {
            const { query } = request;
            const { currentAdmin } = context;
            const { sortBy, direction, filters = {} } = flat.unflatten(query || {}) as ActionQueryParameters;
            const { resource, _admin } = context;
            let { page } = flat.unflatten(query || {}) as ActionQueryParameters;

            const perPage = _admin.options.settings?.defaultPerPage ?? 10;
            page = Number(page) || 1;

            const listProperties = resource.decorate().getListProperties();
            const firstProperty = listProperties.find((p) => p.isSortable());
            let sort;
            if (firstProperty) {
              sort = sortSetter({ sortBy, direction }, firstProperty.name(), resource.decorate().options);
            }

            const results = await findProjects(filters, {
              limit: perPage,
              offset: (page - 1) * perPage,
              sort,
              status,
              currentAdmin,
            });

            const records = await Promise.all(
              results.map(async (item) => {
                const params = paramConverter.prepareParams(item ?? {}, resource);
                const { tags = [], approvedById, ownerId } = params;
                params.tags = tags.length ? tags.map((tag) => tag.tagId)[0] : null;
                params.approvedBy = approvedById;
                params.owner = ownerId;
                const record = await resource.build(params);
                const [populatedRecord] = await populator([record], context);
                return populatedRecord;
              }),
            );

            const populatedRecords = await populator(records, context);

            // eslint-disable-next-line no-param-reassign
            context.records = populatedRecords;

            const total = await projectCount(filters, status, currentAdmin);
            return {
              meta: {
                total,
                perPage,
                page,
                direction: direction,
                sortBy: sortBy,
              },
              records: populatedRecords.map((r) => r.toJSON(currentAdmin)),
            };
          },
        },
        show: {
          isVisible: false,
        },
        edit: {
          actionType: 'record',
          icon: 'Archive',
          component: ApproveComponent,
          isAccessible: ({ currentAdmin }) => {
            return currentAdmin && currentAdmin.roles[0] >= ROLE.APPROVER && status === ProjectStatus.Pending;
          },
          handler: async (request, response, context) => {
            const { record, resource, currentAdmin, h } = context;
            if (!record) {
              throw new NotFoundError(
                [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
                'Action#handler',
              );
            }

            if (request.method === 'get') {
              return {
                record: record.toJSON(currentAdmin),
              };
            }
            request.payload.approvedBy = currentAdmin.id;
            request.payload.approvedAt = new Date();
            const params = paramConverter.prepareParams(request.payload ?? {}, resource);
            if (params.tags) {
              await createProjectTags(params.id, Number(params.tags));
            }

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
