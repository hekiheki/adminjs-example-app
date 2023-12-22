import AdminJS, { Router as AdminRouter } from 'adminjs';
import express, { Router } from 'express';
import formidableMiddleware from 'express-formidable';
import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import {
  withLogin,
  withLogout,
  withProtectedRoutesHandler,
  buildAssets,
  buildRoutes,
  initializeAdmin,
  OldBodyParserUsedError,
  WrongArgumentError,
  AuthenticationOptions,
  FormidableOptions,
} from '@adminjs/express';

import { withAuthLogin } from './withAuthLogin.js';
import { client } from '../../prisma/config.js';

const MISSING_AUTH_CONFIG_ERROR = 'You must configure either "authenticate" method or assign an auth "provider"';
const INVALID_AUTH_CONFIG_ERROR =
  'You cannot configure both "authenticate" and "provider". "authenticate" will be removed in next major release.';

/**
 * @typedef {Function} Authenticate
 * @memberof module:@adminjs/express
 * @description
 * function taking 2 arguments email and password
 * @param {string} [email]         email given in the form
 * @param {string} [password]      password given in the form
 * @return {CurrentAdmin | null}      returns current admin or null
 */

/**
 * Builds the Express Router which is protected by a session auth
 *
 * Using the router requires you to install `express-session` as a
 * dependency. Normally express-session holds session in memory, which is
 * not optimized for production usage and, in development, it causes
 * logging out after every page refresh (if you use nodemon).
 * @static
 * @memberof module:@adminjs/express
 */

export const sessionStore = new PrismaSessionStore(client, {
  checkPeriod: 2 * 60 * 1000, // 2 minutes
  dbRecordIdIsSessionId: true,
  // flushExpired: true,
});

export const buildAuthenticatedRouter = (
  admin: AdminJS,
  auth: AuthenticationOptions,
  predefinedRouter?: express.Router | null,
  sessionOptions?: session.SessionOptions,
  formidableOptions?: FormidableOptions,
): Router => {
  initializeAdmin(admin);

  const { routes, assets } = AdminRouter;
  const router = predefinedRouter || express.Router();

  if (!auth.authenticate && !auth.provider) {
    throw new WrongArgumentError(MISSING_AUTH_CONFIG_ERROR);
  }

  if (auth.authenticate && auth.provider) {
    throw new WrongArgumentError(INVALID_AUTH_CONFIG_ERROR);
  }

  if (auth.provider) {
    admin.options.env = {
      ...admin.options.env,
      ...auth.provider.getUiProps(),
    };
  }

  router.use((req, _, next) => {
    if ((req as any)._body) {
      next(new OldBodyParserUsedError());
    }
    next();
  });

  // todo fix types
  router.use(
    session({
      ...sessionOptions,
      secret: auth.cookiePassword,
      name: auth.cookieName || 'adminjs',
    }) as any,
  );

  router.use(formidableMiddleware(formidableOptions) as any);

  withLogin(router, admin, auth);
  withAuthLogin(router, admin);
  withLogout(router, admin, auth);
  buildAssets({ admin, assets, routes, router });

  withProtectedRoutesHandler(router, admin);
  // withRefresh(router, admin, auth);
  buildRoutes({ admin, routes, router });

  return router;
};
