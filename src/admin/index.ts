// Adapters
import { Database as PrismaDatabase, Resource as PrismaResource } from '@adminjs/prisma';
import { dark, light } from '@adminjs/themes';
import AdminJS, { AdminJSOptions, ResourceOptions } from 'adminjs';
import { CreateUserResource, CreateRoleResource, CreateUserRolesResource } from '../prisma/resources/index.js';
import './components.bundler.js';
import { componentLoader, CUSTOM_PAGE } from './components.bundler.js';
import { locale } from './locale/index.js';
import { customTheme } from '../themes/index.js';

AdminJS.registerAdapter({ Database: PrismaDatabase, Resource: PrismaResource });

export const menu: Record<string, ResourceOptions['navigation']> = {
  manager: {
    name: '管理用户',
    icon: 'User',
  },
  project: {
    name: '项目列表',
    icon: 'List',
  },
};

export const generateAdminJSConfig: () => AdminJSOptions = () => ({
  version: { admin: false, app: '2.0.0' },
  rootPath: '/admin',
  locale,
  assets: {
    styles: ['/custom.css'],
    scripts: process.env.NODE_ENV === 'production' ? ['/gtm.js'] : [],
  },
  branding: {
    companyName: 'Demo',
    favicon: '/favicon.ico',
    theme: {
      colors: { primary100: '#4D70EB' },
    },
  },
  dashboard: {
    component: CUSTOM_PAGE,
  },
  defaultTheme: 'light',
  availableThemes: [light, dark, customTheme],
  componentLoader,
  resources: [CreateUserResource(), CreateRoleResource(), CreateUserRolesResource()],
});
