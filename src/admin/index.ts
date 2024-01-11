// Adapters
import { Database as PrismaDatabase, Resource as PrismaResource } from '@adminjs/prisma';
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
import { componentLoader, HOME } from './components.bundler.js';
import { locale } from './locale/index.js';

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

export enum ProjectStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export const generateAdminJSConfig: () => AdminJSOptions = () => ({
  // version: { admin: false, app: '2.0.0' },
  rootPath: '/',
  loginPath: '/login',
  logoutPath: '/logout',
  locale,
  assets: {
    styles: ['/custom.css'],
    // scripts: process.env.NODE_ENV === 'production' ? ['/gtm.js'] : [],
  },
  env: {
    REDIRECT_URI: '/callback-for-dingtalk',
  },
  branding: {
    companyName: process.env.COMPANY_NAME || '宁波市大数据发展管理局',
    favicon: '/favicon.ico',
    logo: '',
    theme: {
      colors: { primary100: '#4D70EB' },
    },
    withMadeWithLove: false,
  },
  dashboard: {
    component: HOME,
  },
  defaultTheme: 'light',
  componentLoader,
  resources: [
    CreateUserRolesResource(),
    CreateUserResource(),
    CreateRoleResource(),
    CreateProjectResource(),
    CreateProjectResource(ProjectStatus.Approved),
    CreateProjectResource(ProjectStatus.Rejected),
    CreateProjectTagsResource(),
    CreateTagResource(),
    CreateLogResource(),
  ],
});
