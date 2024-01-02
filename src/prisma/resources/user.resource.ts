import { NotFoundError, paramConverter, populator, ValidationError, flat, ActionQueryParameters } from 'adminjs';

import { usePasswordsFeature, useFormValidate, useLoggerFeature } from '../../admin/features/index.js';
import { Thumb } from '../../admin/components.bundler.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';
import { menu } from '../../admin/index.js';
import { ROLE } from '../../admin/constants/authUsers.js';
import {
  findUserRoles,
  updateUserRoles,
  createUserRoles,
  deleteUserRoles,
  findUsers,
  userCount,
} from '../data/user.js';
import sortSetter from '../utils/sort.js';

export const CreateUserResource: ResourceFunction<{
  model: typeof dmmf.modelMap.User;
  client: typeof client;
}> = () => ({
  resource: {
    model: dmmf.modelMap.User,
    client,
  },
  features: [useFormValidate(), usePasswordsFeature(), useLoggerFeature()],
  options: {
    navigation: menu.manager,
    id: 'user',
    properties: {
      id: {
        isVisible: false,
      },
      avatarUrl: {
        isVisible: { list: false, show: true, edit: false, filter: false },
        components: {
          show: Thumb,
        },
        position: 1,
      },
      username: {
        isVisible: true,
        isSortable: true,
        position: 2,
        custom: {
          required: true,
          unique: true,
          title: '用户名',
        },
      },
      nick: {
        isVisible: true,
        isTitle: true,
        position: 5,
        isRequired: true,
        custom: {
          required: true,
          title: '姓名',
        },
      },
      mobile: {
        isVisible: { list: true, show: true, edit: false, filter: true },
        isDisabled: true,
        position: 6,
      },
      roles: {
        reference: 'role',
        isVisible: true,
        position: 7,
        isRequired: true,
        custom: {
          required: true,
          title: '权限',
        },
      },
      unionId: {
        isVisible: false,
      },
      openId: {
        isVisible: false,
      },
      status: {
        isVisible: false,
      },
      stateCode: {
        isVisible: false,
      },
      createdAt: {
        isVisible: { show: true, edit: false, list: false, filter: false },
      },
      updatedAt: {
        isVisible: { show: true, edit: false, list: false, filter: false },
      },
    },
    actions: {
      new: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
        handler: async (request, response, context) => {
          const { resource, h, currentAdmin } = context;
          if (request.method === 'post') {
            const params = paramConverter.prepareParams(request.payload ?? {}, resource);

            let record = await resource.build(params);

            record = await record.create(context);
            const [populatedRecord] = await populator([record], context);
            await createUserRoles(Number(record.id()), Number(params.roles));

            // eslint-disable-next-line no-param-reassign
            context.record = populatedRecord;

            if (record.isValid()) {
              return {
                redirectUrl: h.resourceUrl({ resourceId: resource._decorated?.id() || resource.id() }),
                notice: {
                  message: 'successfullyCreated',
                  type: 'success',
                },
                record: record.toJSON(currentAdmin),
              };
            }
            const baseMessage = populatedRecord.baseError?.message || 'thereWereValidationErrors';
            return {
              record: record.toJSON(currentAdmin),
              notice: {
                message: baseMessage,
                type: 'error',
              },
            };
          }
        },
      },
      edit: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
        handler: async (request, response, context) => {
          const { record, resource, currentAdmin, h } = context;
          if (!record) {
            throw new NotFoundError(
              [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
              'Action#handler',
            );
          }
          if (request.method === 'get') {
            const { id: roleId } = await findUserRoles(record.params.id);
            record.params.roles = roleId;
            record.params.password = null;
            return { record: record.toJSON(currentAdmin) };
          }

          const params = paramConverter.prepareParams(request.payload ?? {}, resource);
          const newRecord = await record.update(params, context);
          const [populatedRecord] = await populator([newRecord], context);
          await updateUserRoles(params.id, Number(params.roles));

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
      delete: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
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
            await deleteUserRoles(Number(record.id()));
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
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
        // isVisible: false,
        handler: async (request, response, context) => {
          const { records, resource, h } = context;

          if (!records || !records.length) {
            throw new NotFoundError('no records were selected.', 'Action#handler');
          }
          if (request.method === 'get') {
            const recordsInJSON = records.map((record) => record.toJSON(context.currentAdmin));
            return {
              records: recordsInJSON,
            };
          }
          if (request.method === 'post') {
            await Promise.all(
              records.map(async (record) => {
                await deleteUserRoles(Number(record.id()));
                return resource.delete(record.id(), context);
              }),
            );
            return {
              records: records.map((record) => record.toJSON(context.currentAdmin)),
              notice: {
                message: records.length > 1 ? 'successfullyBulkDeleted_plural' : 'successfullyBulkDeleted',
                options: { count: records.length },
                resourceId: resource.id(),
                type: 'success',
              },
              redirectUrl: h.resourceUrl({ resourceId: resource._decorated?.id() || resource.id() }),
            };
          }
          throw new Error('method should be either "post" or "get"');
        },
      },
      show: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
        handler: async (request, response, context) => {
          const { record, currentAdmin, resource } = context;
          if (!record) {
            throw new NotFoundError(
              [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
              'Action#handler',
            );
          }
          const { name } = await findUserRoles(record.params.id);
          record.params.roles = name;
          record.params.password = null;
          return {
            record: record.toJSON(currentAdmin),
          };
        },
      },
      list: {
        showFilter: true,
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
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

          const results = await findUsers(filters, {
            limit: perPage,
            offset: (page - 1) * perPage,
            sort,
          });

          const records = await Promise.all(
            results.map(async (item) => {
              const params = paramConverter.prepareParams(item ?? {}, resource);
              const { roles = [] } = params;
              params.roles = roles.length ? roles.map((role) => role.roleId)[0] : null;
              params.password = null;
              const record = await resource.build(params);
              const [populatedRecord] = await populator([record], context);
              return populatedRecord;
            }),
          );

          const populatedRecords = await populator(records, context);

          // eslint-disable-next-line no-param-reassign
          context.records = populatedRecords;

          const total = await userCount(filters);
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
    },
  },
});
