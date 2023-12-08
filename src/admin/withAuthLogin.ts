import AdminJS from 'adminjs';
import { Router } from 'express';
import fetch from 'node-fetch';
import { client } from '../prisma/config.js';
import argon2 from 'argon2';
import { Roles } from '@prisma/client';

const requestUserToken = async (code) => {
  try {
    const response = await fetch('https://api.dingtalk.com/v1.0/oauth2/userAccessToken', {
      method: 'POST',
      body: JSON.stringify({
        clientId: process.env.DINGTALK_CLIENT_ID,
        clientSecret: process.env.DINGTALK_CLIENT_SECRET,
        code,
        grantType: 'authorization_code',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error('获取用户token失败');
    }
  } catch (error) {
    throw new Error(error);
  }
};

const getUserInfo = async (accessToken) => {
  try {
    const response = await fetch('https://api.dingtalk.com/v1.0/contact/users/me', {
      method: 'GET',
      headers: {
        'x-acs-dingtalk-access-token': accessToken,
      },
    });
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error('获取用户信息失败');
    }
  } catch (error) {
    throw new Error(error);
  }
};

const saveUser = async (userInfo) => {
  const { unionId, nick, openId, avatarUrl, mobile, stateCode } = userInfo;
  const user = await client.user.findFirst({
    where: {
      unionId,
    },
  });
  if (user) {
    return user;
  } else {
    const newUser = await client.user.create({
      data: {
        unionId,
        nick,
        openId,
        avatarUrl,
        mobile,
        stateCode,
        username: mobile,
        password: await argon2.hash('123456'),
      },
    });

    const defaultRole = await client.role.findFirst({
      where: {
        name: Roles.USER,
      },
    });

    await client.userRoles.createMany({
      data: {
        roleId: defaultRole.id,
        userId: newUser.id,
      },
    });
    return newUser;
  }
};

const getLoginPath = (path, rootPath): string => {
  // since we are inside already namespaced router we have to replace login and logout routes that
  // they don't have rootUrl inside. So changing /admin/login to just /login.
  // but there is a case where user gives / as a root url and /login becomes `login`. We have to
  // fix it by adding / in front of the route
  const normalizedLoginPath = path.replace(rootPath, '');

  return normalizedLoginPath.startsWith('/') ? normalizedLoginPath : `/${normalizedLoginPath}`;
};

export const withAuthLogin = (router: Router, admin: AdminJS): void => {
  const { rootPath, authLogin, authCallback, loginPath } = admin.options as any;
  const loginPagePath = getLoginPath(loginPath, rootPath);
  const authLoginPath = getLoginPath(authLogin, rootPath);
  const redirectPath = getLoginPath(authCallback, rootPath);

  router.get(authLoginPath, async (req, res) => {
    const host = process.env.HOST;
    const clientId = process.env.DINGTALK_CLIENT_ID;

    const redirect_uri = encodeURIComponent(`${host}${redirectPath}`);

    const redirectUrl = `https://login.dingtalk.com/oauth2/auth?redirect_uri=${redirect_uri}&client_id=${clientId}&response_type=code&scope=openid&prompt=consent`;
    return res.redirect(redirectUrl);
  });

  router.get(redirectPath, async (req, res, next) => {
    const response: any = await requestUserToken(req.query.authCode);
    const data = await getUserInfo(response.accessToken);
    const adminUser = await saveUser(data);
    if (adminUser) {
      const session = req.session as any;
      session.adminUser = adminUser;
      session.save((err) => {
        if (err) {
          return next(err);
        }
        if (session.redirectTo) {
          return res.redirect(302, session.redirectTo);
        } else {
          return res.redirect(302, rootPath);
        }
      });
    } else {
      return res.redirect(loginPagePath);
    }
  });
};
