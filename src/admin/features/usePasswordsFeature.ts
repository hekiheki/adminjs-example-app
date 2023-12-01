import argon2 from 'argon2';
import passwordsFeature from '@adminjs/passwords';
import { componentLoader } from '../components.bundler.js';

export const usePasswordsFeature = () => {
  return passwordsFeature({
    componentLoader,
    properties: {
      encryptedPassword: 'password',
      password: 'Password',
    },
    hash: argon2.hash,
  });
};
