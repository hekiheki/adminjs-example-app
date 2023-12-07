import { Router } from 'express';
import fetch from 'node-fetch';
import { client } from '../prisma/config.js';
import argon2 from 'argon2';
import { SessionData } from '@adminjs/express';
import { authProvider } from '../admin/router.js';
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
    return newUser;
  }
};

router.get('/sso/login', function (req, res, next) {
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
    (req.session as SessionData).adminUser = user;
    req.session.save((err) => {
      if (err) {
        return next(err);
      }
      if ((req.session as SessionData).redirectTo) {
        return res.redirect(302, (req.session as SessionData).redirectTo);
      } else {
        return res.redirect(302, '/');
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
