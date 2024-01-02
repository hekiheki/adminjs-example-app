import { BaseAuthProvider, LoginHandlerOptions, RefreshTokenHandlerOptions } from 'adminjs';
import argon2 from 'argon2';

import { findUser } from '../../prisma/data/user.js';
import { componentLoader } from '../components.bundler.js';

export class DefaultAuthProvider extends BaseAuthProvider {
  protected readonly authenticate;

  constructor({ authenticate }: any) {
    super();
    this.authenticate = authenticate;
  }

  override async handleLogin(opts: LoginHandlerOptions, context?: any) {
    const { data = {} } = opts;
    const { username, password } = data;
    return this.authenticate({ username, password }, context);
  }

  override async handleRefreshToken(opts: RefreshTokenHandlerOptions, context?: any): Promise<any> {
    return Promise.resolve({});
  }
}

export const authenticate = async ({ username, password }) => {
  if (!username || !password) {
    return null;
  }

  const user: any = await findUser(
    {
      username,
    },
    {
      id: true,
      username: true,
      roles: true,
      mobile: true,
      nick: true,
      avatarUrl: true,
      status: true,
      password: true,
    },
  );

  const isPasswordVerified = await argon2.verify(user.password, password);
  if (isPasswordVerified) {
    delete user.password;
    return Promise.resolve({
      ...user,
      roles: user.roles?.map((role) => role.roleId) || [],
    });
  }
  return null;
};

export const authProvider = new DefaultAuthProvider({
  componentLoader,
  authenticate,
});
