import { Router } from 'express';
import fetch from 'node-fetch';
import { client } from '../prisma/config.js';
import argon2 from 'argon2';
import { Roles } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import session from 'express-session';

const router = Router();

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
    select: {
      id: true,
      username: true,
      roles: true,
      mobile: true,
      nick: true,
      avatarUrl: true,
      status: true,
    },
  });
  if (user) {
    return {
      ...user,
      roles: user.roles.map((role) => role.roleId),
    };
  } else {
    const newUser = await client.user.create({
      data: {
        unionId,
        nick,
        openId,
        avatarUrl,
        mobile,
        stateCode,
        username: nick,
      },
    });

    const defaultRole = await client.role.findFirst({
      where: {
        name: Roles.USER,
      },
    });

    await client.userRoles.create({
      data: {
        roleId: defaultRole.id,
        userId: newUser.id,
      },
    });

    return {
      id: newUser.id,
      username: newUser.username,
      roles: [defaultRole.id],
      mobile: newUser.mobile,
      nick: newUser.nick,
      avatarUrl: newUser.avatarUrl,
      status: newUser.status,
    };
  }
};

const sessionStore = new PrismaSessionStore(client, {
  checkPeriod: 2 * 60 * 1000, // 2 minutes
  dbRecordIdIsSessionId: true,
  // flushExpired: true,
});

router.use(
  session({
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
  }) as any,
);

router.get('/auth/login', function (req, res, next) {
  const host = process.env.HOST;
  const clientId = process.env.DINGTALK_CLIENT_ID;

  const redirect_uri = encodeURIComponent(`${host}/callback-for-dingtalk`);

  const redirectUrl = `https://login.dingtalk.com/oauth2/auth?redirect_uri=${redirect_uri}&client_id=${clientId}&response_type=code&scope=openid&prompt=consent`;
  res.redirect(redirectUrl);
  next();
});

router.get('/callback-for-dingtalk', async function (req, res, next) {
  try {
    const response: any = await requestUserToken(req.query.authCode);
    const data = await getUserInfo(response.accessToken);
    const user = await saveUser(data);
    const session = req.session as any;
    session.adminUser = user;
    session.save((err) => {
      if (err) {
        return next(err);
      }
      if (session.redirectTo) {
        return res.redirect(302, session.redirectTo);
      } else {
        return res.redirect(302, '/');
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
