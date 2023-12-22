import AdminJS from 'adminjs';
import { Router } from 'express';

import { authProvider, buildAuthenticatedRouter, sessionStore } from './authtication/index.js';

export const expressAuthenticatedRouter = (adminJs: AdminJS, router: Router | null = null) => {
  return buildAuthenticatedRouter(
    adminJs,
    {
      cookieName: process.env.NAME,
      cookiePassword: process.env.SESSION_SECRET,
      provider: authProvider,
      maxRetries: 5,
    },
    router,
    {
      store: sessionStore,
      resave: true,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET,
      cookie: {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      },
      name: process.env.NAME,
    },
  );
};
