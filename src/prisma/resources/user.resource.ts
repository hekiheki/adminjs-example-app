import { flat, ActionQueryParameters } from 'adminjs';
import { usePasswordsFeature, useFormValidate } from '../../admin/features/index.js';
import { Thumb } from '../../admin/components.bundler.js';
import { ResourceFunction } from '../../admin/types/index.js';
import { client, dmmf } from '../config.js';
import { menu } from '../../admin/index.js';
import { ROLE } from '../../admin/constants/authUsers.js';
import { getUserRoles, saveUserRoles, deleteUserRoles, getUsersRoles } from '../hooks/managerUserRolesHook.js';

export const CreateUserResource: ResourceFunction<{
  model: typeof dmmf.modelMap.User;
  client: typeof client;
}> = () => ({
  resource: {
    model: dmmf.modelMap.User,
    client,
  },
  features: [useFormValidate(), usePasswordsFeature()],
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
    },
    actions: {
      new: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
        after: [saveUserRoles],
      },
      edit: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
        after: [getUserRoles, saveUserRoles],
      },
      delete: {
        isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.roles.includes(ROLE.ADMIN),
        before: [deleteUserRoles],
      },
      bulkDelete: {
        isAccessible: false,
        isVisible: false,
      },
      show: {
        isAccessible: ({ currentAdmin }) =>
          currentAdmin && (currentAdmin.roles.includes(ROLE.DEVELOPER) || currentAdmin.roles.includes(ROLE.ADMIN)),
        after: [getUserRoles],
      },
      list: {
        showFilter: true,
        isAccessible: ({ currentAdmin }) =>
          currentAdmin && (currentAdmin.roles.includes(ROLE.DEVELOPER) || currentAdmin.roles.includes(ROLE.ADMIN)),
        // before: async (request, context) => {
        //   const { query } = request;
        //   const { sortBy, filters = {} } = flat.unflatten(query || {}) as ActionQueryParameters;
        //   const { properties } = context.resource.decorate().toJSON(context.currentAdmin);
        //   const keys = Object.keys(filters);
        //   if (Object.keys(properties).indexOf(sortBy) === -1) {
        //     delete query.sortBy;
        //   }
        //   for (let index = 0; index < keys.length; index += 1) {
        //     const key = keys[index];
        //     const isResourceProperty = Object.keys(properties).indexOf(key) >= 0;
        //     const filterKey = `filters.${key}`;
        //     if (key === 'roles') {
        //       query[`search.${key}`] = Number(query[filterKey]) ? query[filterKey] : null;
        //       delete query[filterKey];
        //     }
        //     if (!isResourceProperty) {
        //       delete query[filterKey];
        //     }
        //   }
        //   return request;
        // },
        after: [getUsersRoles],
      },
    },
  },
});
