import loggerFeature from '@adminjs/logger';
import { componentLoader } from '../components.bundler.js';

export const useLoggerFeature = () => {
  return loggerFeature({
    componentLoader,
    propertiesMapping: {
      user: 'userId',
    },
    userIdAttribute: 'id',
  });
};
