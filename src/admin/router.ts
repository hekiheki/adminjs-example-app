import AdminJSExpress from '@adminjs/express';
import AdminJS from 'adminjs';
import { Router } from 'express';

export const expressAuthenticatedRouter = (adminJs: AdminJS, router: Router | null = null) => {
  return AdminJSExpress.buildRouter(adminJs, router);
};
