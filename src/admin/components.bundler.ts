import { ComponentLoader, OverridableComponent } from 'adminjs';
import path from 'path';
import url from 'url';

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
override('components/topBar', 'TopBar');
override('components/sidebarBranding', 'SidebarBranding');
override('components/sidebarFooter', 'SidebarFooter');
override('components/list/propertyHeader', 'PropertyHeader');
override('components/reference/edit', 'DefaultReferenceEditProperty');
override('components/reference/show', 'DefaultReferenceShowProperty');
override('components/reference/list', 'DefaultReferenceListProperty');
override('components/reference/filter', 'DefaultReferenceFilterProperty');

/**
 * Common components
 */
export const Thumb = add('components/thumb', 'Thumb');
export const ResetPasswordComponent = add('components/resetPasswordComponent', 'ResetPasswordComponent');
export const ApproveComponent = add('components/approveAction', 'ApproveAction');
export const UploadEditComponent = add('components/uploadFile/uploadEditComponent', 'UploadEdit');
export const UploadListComponent = add('components/uploadFile/uploadListComponent', 'UploadList');
export const UploadShowComponent = add('components/uploadFile/uploadShowComponent', 'UploadShow');

/**
 * Pages
 */
export const HOME = add('pages/homePage', 'Home');
