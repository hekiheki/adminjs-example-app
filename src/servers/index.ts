import path from 'path';
import express, { Express } from 'express';
import cors from 'cors';
import AdminJS from 'adminjs';
import { fileURLToPath } from 'url';
import router from './router.js';

import { generateAdminJSConfig } from '../admin/index.js';
import { expressAuthenticatedRouter } from '../admin/router.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const attachAdminJS = async (app: Express) => {
  const config = generateAdminJSConfig();
  const adminJS = new AdminJS(config);

  if (process.env.NODE_ENV === 'production') await adminJS.initialize();
  else adminJS.watch();

  const adminRouter = expressAuthenticatedRouter(adminJS);

  app.use(adminJS.options.rootPath, adminRouter);
  app.use(adminJS.options.rootPath, router);
  app.get('/', (req, res) => res.redirect(adminJS.options.rootPath));
  app.use(express.static(path.join(__dirname, '../../public')));
};

const start = async () => {
  const app = express();
  app.enable('trust proxy');
  app.use(cors({ credentials: true, origin: true }));
  await attachAdminJS(app);

  app.listen(process.env.PORT, async () => {
    console.log(`AdminJS is under http://localhost:${process.env.PORT}`);
  });
};

start();
