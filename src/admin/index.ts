// Adapters
import { Database as PrismaDatabase, Resource as PrismaResource } from '@adminjs/prisma';
import { dark, light, noSidebar } from '@adminjs/themes';
import AdminJS, { AdminJSOptions, ResourceOptions } from 'adminjs';
import { CreateUserResource, CreateRoleResource, CreateUserRolesResource } from '../prisma/resources/index.js';
import './components.bundler.js';
import { componentLoader } from './components.bundler.js';
import { locale } from './locale/index.js';
import pages from './pages/index.js';
import { customTheme } from '../themes/index.js';

AdminJS.registerAdapter({ Database: PrismaDatabase, Resource: PrismaResource });

export const menu: Record<string, ResourceOptions['navigation']> = {
  user: { name: 'User', icon: 'User' },
  roles: { name: 'Roles', icon: 'List' },
};

export const generateAdminJSConfig: () => AdminJSOptions = () => ({
  version: { admin: true, app: '2.0.0' },
  rootPath: '/admin',
  locale,
  assets: {
    styles: ['/custom.css'],
    scripts: process.env.NODE_ENV === 'production' ? ['/gtm.js'] : [],
  },
  branding: {
    companyName: 'AdminJS demo page',
    favicon: '/favicon.ico',
    theme: {
      colors: { primary100: '#4D70EB' },
    },
  },
  defaultTheme: 'light',
  availableThemes: [light, dark, noSidebar, customTheme],
  componentLoader,
  pages,
  env: {
    STORYBOOK_URL: process.env.STORYBOOK_URL,
    GITHUB_URL: process.env.GITHUB_URL,
    SLACK_URL: process.env.SLACK_URL,
    DOCUMENTATION_URL: process.env.DOCUMENTATION_URL,
  },
  resources: [CreateUserResource(), CreateRoleResource(), CreateUserRolesResource()],
});
