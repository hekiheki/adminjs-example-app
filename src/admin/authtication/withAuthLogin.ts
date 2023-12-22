import AdminJS from 'adminjs';
import { Router } from 'express';
import fetch from 'node-fetch';

import { findUser, createUser } from '../../prisma/data/user.js';

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
  const user: any = await findUser(
    {
      unionId,
    },
    {
      id: true,
      username: true,
      roles: true,
      mobile: true,
      nick: true,
      avatarUrl: true,
      status: true,
    },
  );
  if (user) {
    return {
      ...user,
      roles: user.roles?.map((role) => role.roleId) || [],
    };
  } else {
    const newUser = await createUser({
      unionId,
      nick,
      openId,
      avatarUrl,
      mobile,
      stateCode,
      username: mobile,
    });

    return {
      id: newUser.id,
      username: newUser.mobile,
      roles: newUser.roles,
      mobile: newUser.mobile,
      nick: newUser.nick,
      avatarUrl: newUser.avatarUrl,
      status: newUser.status,
    };
  }
};

export const withAuthLogin = (router: Router, admin: AdminJS): void => {
  const { rootPath } = admin.options as any;

  router.get('/auth/login', async (req, res) => {
    const host = process.env.HOST;
    const clientId = process.env.DINGTALK_CLIENT_ID;

    const redirect_uri = encodeURIComponent(`${host}/callback-for-dingtalk`);

    const redirectUrl = `https://login.dingtalk.com/oauth2/auth?redirect_uri=${redirect_uri}&client_id=${clientId}&response_type=code&scope=openid&prompt=consent`;
    return res.redirect(redirectUrl);
  });

  router.get('/callback-for-dingtalk', async (req, res, next) => {
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
      return res.redirect('/login');
    }
  });
};
