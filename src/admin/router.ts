import AdminJSExpress from '@adminjs/express';
import AdminJS from 'adminjs';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import argon2 from 'argon2';
import { Router } from 'express';
import { client } from '../prisma/config.js';
import { componentLoader } from './components.bundler.js';
import { DefaultAuthProvider } from './providers/auth-provider.js';

export const authenticate = async ({ username, password }) => {
  const user = await client.user.findFirst({
    where: {
      username,
    },
    include: {
      roles: true,
    },
  });
  if (user && (await argon2.verify(user.password, password))) {
    return Promise.resolve({
      id: user.id,
      username: user.username,
      roles: user.roles.map((role) => role.roleId),
      mobile: user.mobile,
      nick: user.nick,
      avatarUrl: user.avatarUrl,
      status: user.status,
    });
  }
  return null;
};

export const authProvider = new DefaultAuthProvider({
  componentLoader,
  authenticate,
});

export const expressAuthenticatedRouter = (adminJs: AdminJS, router: Router | null = null) => {
  const sessionStore = new PrismaSessionStore(client, {
    checkPeriod: 2 * 60 * 1000, // 2 minutes
    dbRecordIdIsSessionId: true,
    // flushExpired: true,
  });

  return AdminJSExpress.buildAuthenticatedRouter(
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
