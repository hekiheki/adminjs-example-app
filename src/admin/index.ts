// Adapters
import { Database as PrismaDatabase, Resource as PrismaResource } from '@adminjs/prisma';
import { dark, light } from '@adminjs/themes';
import AdminJS, { AdminJSOptions, ResourceOptions } from 'adminjs';
import {
  CreateUserResource,
  CreateRoleResource,
  CreateUserRolesResource,
  CreateProjectResource,
  CreateProjectTagsResource,
  CreateTagResource,
  CreateLogResource,
} from '../prisma/resources/index.js';
import './components.bundler.js';
import { componentLoader, CUSTOM_PAGE } from './components.bundler.js';
import { locale } from './locale/index.js';
import { customTheme } from '../themes/index.js';

AdminJS.registerAdapter({ Database: PrismaDatabase, Resource: PrismaResource });

export const menu: Record<string, ResourceOptions['navigation']> = {
  manager: {
    name: 'manager',
    icon: 'User',
  },
  project: {
    name: 'project',
    icon: 'List',
  },
};

export const generateAdminJSConfig: () => AdminJSOptions = () => ({
  version: { admin: false, app: '2.0.0' },
  rootPath: '/',
  loginPath: '/login',
  locale,
  assets: {
    styles: ['/custom.css'],
    scripts: process.env.NODE_ENV === 'production' ? ['/gtm.js'] : [],
  },
  branding: {
    companyName: process.env.COMPANY_NAME,
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
  resources: [
    CreateUserResource(),
    CreateRoleResource(),
    CreateUserRolesResource(),
    CreateProjectResource(),
    CreateProjectTagsResource(),
    CreateTagResource(),
    CreateLogResource(),
  ],
});
