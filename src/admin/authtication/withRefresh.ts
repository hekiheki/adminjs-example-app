import AdminJS, { CurrentAdmin } from 'adminjs';
import { Router } from 'express';
import { AuthenticationOptions, WrongArgumentError } from '@adminjs/express';

const getRefreshTokenPath = (admin: AdminJS) => {
  const { refreshTokenPath, rootPath } = admin.options;
  const normalizedRefreshTokenPath = refreshTokenPath.replace(rootPath, '');

  return normalizedRefreshTokenPath.startsWith('/') ? normalizedRefreshTokenPath : `/${normalizedRefreshTokenPath}`;
};

const MISSING_PROVIDER_ERROR = '"provider" has to be configured to use refresh token mechanism';

export const withRefresh = (router: Router, admin: AdminJS, auth: AuthenticationOptions): void => {
  const refreshTokenPath = getRefreshTokenPath(admin);

  const { provider } = auth;

  router.post(refreshTokenPath, async (request: any, response) => {
    if (!provider) {
      throw new WrongArgumentError(MISSING_PROVIDER_ERROR);
    }

    const updatedAuthInfo = await provider.handleRefreshToken(
      {
        data: request.fields ?? {},
        query: request.query,
        params: request.params,
        headers: request.headers,
      },
      { req: request, res: response },
    );

    const session = request.session as any;

    let admin = session.adminUser as Partial<CurrentAdmin> | null;
    if (!admin) {
      admin = {};
    }

    if (!admin._auth) {
      admin._auth = {};
    }

    admin._auth = {
      ...admin._auth,
      ...updatedAuthInfo,
    };

    session.adminUser = admin;
    session.save(() => {
      response.send(admin);
    });
  });
};
