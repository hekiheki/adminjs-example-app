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
override('components/login', 'Login');
override('components/top-bar', 'TopBar');
override('components/sidebar-resource-section', 'SidebarResourceSection');
override('components/list/property-header', 'PropertyHeader');
override('components/filter-drawer', 'FilterDrawer');
override('components/reference/edit', 'DefaultReferenceEditProperty');
override('components/reference/show', 'DefaultReferenceShowProperty');
override('components/reference/list', 'DefaultReferenceListProperty');
// override('components/password', 'DefaultPasswordEditProperty');
// override('components/edit-action', 'DefaultEditAction');

/**
 * Common components
 */
export const Thumb = add('components/thumb', 'Thumb');
// export const UserForm = add('components/edit-action', 'EditAction');
export const ResetPasswordComponent = add('components/password-edit-component', 'ResetPasswordComponent');

/**
 * Pages
 */
export const HOME = add('pages/home-page', 'Home');
