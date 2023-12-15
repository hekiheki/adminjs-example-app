import { flat, ActionQueryParameters, populator, Filter } from 'adminjs';
import { usePasswordsFeature } from '../../admin/features/index.js';
import { THUMB } from '../../admin/components.bundler.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';
import { menu } from '../../admin/index.js';
import { ROLE } from '../../admin/constants/authUsers.js';
import {
  validateUserForm,
  getUserRoles,
  saveUserRoles,
  deleteUserRoles,
  getUsersRoles,
} from '../hooks/managerUserRolesHook.js';

export const CreateUserResource: ResourceFunction<{
  model: typeof dmmf.modelMap.User;
  client: typeof client;
}> = () => ({
  resource: {
    model: dmmf.modelMap.User,
    client,
  },
  features: [usePasswordsFeature()],
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
          show: THUMB,
        },
        position: 1,
      },
      username: {
        isVisible: true,
        isSortable: true,
        position: 2,
      },
      password: {
        isVisible: false,
        position: 3,
      },
      newPassword: {
        isRequired: true,
        position: 3,
      },
      nick: {
        isVisible: true,
        isTitle: true,
        position: 4,
        isRequired: true,
      },
      mobile: {
        isVisible: { list: true, show: true, edit: false, filter: true },
        isDisabled: true,
        position: 5,
      },
      roles: {
        reference: 'role',
        isVisible: {
          list: true,
          show: true,
          filter: true,
          edit: true,
        },
        position: 6,
        isRequired: true,
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
    },
    actions: {
      new: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
        // isVisible: false,
        before: [validateUserForm],
        after: [saveUserRoles],
      },
      edit: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
        // isVisible: false,
        before: [validateUserForm],
        after: [getUserRoles, saveUserRoles],
      },
      delete: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
        // isVisible: false,
        before: [deleteUserRoles],
      },
      bulkDelete: {
        isAccessible: false,
        isVisible: false,
      },
      show: {
        isAccessible: ({ currentAdmin }) =>
          currentAdmin && (currentAdmin.roles.includes(ROLE.DEVELOPER) || currentAdmin.roles.includes(ROLE.ADMIN)),
        // isVisible: false,
        after: [getUserRoles],
      },
      list: {
        isAccessible: ({ currentAdmin }) =>
          currentAdmin && (currentAdmin.roles.includes(ROLE.DEVELOPER) || currentAdmin.roles.includes(ROLE.ADMIN)),
        before: async (request, context) => {
          const { query } = request;
          const { sortBy, filters = {} } = flat.unflatten(query || {}) as ActionQueryParameters;
          const { properties } = context.resource.decorate().toJSON(context.currentAdmin);
          const keys = Object.keys(filters);
          if (Object.keys(properties).indexOf(sortBy) === -1) {
            delete query.sortBy;
          }
          for (let index = 0; index < keys.length; index += 1) {
            const key = keys[index];
            const isResourceProperty = Object.keys(properties).indexOf(key) >= 0;
            const filterKey = `filters.${key}`;
            if (key === 'roles') {
              query[`search.${key}`] = Number(query[filterKey]) ? query[filterKey] : null;
              delete query[filterKey];
            }
            if (!isResourceProperty) {
              delete query[filterKey];
            }
          }
          return request;
        },
        after: [getUsersRoles],
      },
      newAction: {
        type: 'resource',
        showFilter: true,
        showResourceActions: true,
        // handle: async () => {},
      },
    },
  },
});
