// import passwordsFeature from '@adminjs/passwords';
import passwordsFeature from './customPasswordFeature.js';
import { componentLoader } from '../components.bundler.js';
import argon2 from 'argon2';

export const usePasswordsFeature = () => {
  return passwordsFeature({
    componentLoader,
    properties: {
      encryptedPassword: 'password',
      password: 'newPassword',
    },
    hash: argon2.hash,
  });
};
