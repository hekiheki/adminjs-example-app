import { ComponentLoader, OverridableComponent } from 'adminjs';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const componentLoader = new ComponentLoader();

export const add = (url: string, componentName: string): string =>
  componentLoader.add(componentName, path.join(__dirname, url));

export const override = (url: string, componentName: OverridableComponent): string =>
  componentLoader.override(componentName, path.join(__dirname, url));

/**
 * Overridable components
 */
override('components/top-bar', 'Version');
override('components/login', 'Login');
// override('components/auth', 'AuthenticationBackgroundComponent');

/**
 * Common components
 */
export const DONT_TOUCH_THIS_ACTION = add('components/dont-touch-this-action', 'CustomAction');
export const DETAILED_STATS = add('components/detailed-stats', 'DetailedStats');
export const THUMB = add('components/thumb', 'Thumb');
export const MANY_TO_MANY_EDIT = add('components/many-to-many/edit', 'ManyToManyEdit');
export const MANY_TO_MANY_LIST = add('components/many-to-many/list', 'ManyToManyList');
export const MANY_TO_MANY_SHOW = add('components/many-to-many/show', 'ManyToManyShow');

/**
 * Pages
 */
export const CUSTOM_PAGE = add('pages/custom-page', 'CustomPage');
export const DESIGN_SYSTEM_PAGE = add('pages/design-system-examples/index', 'DesignSystemPage');
