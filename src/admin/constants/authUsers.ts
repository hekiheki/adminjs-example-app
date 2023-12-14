import { Roles } from '@prisma/client';

export enum ROLE {
  PUBLISHER = 1,
  APPROVER = 2,
  ADMIN = 3,
  DEVELOPER = 4,
}

export type AuthUser = {
  username: string;
  password: string;
};

export type AuthRole = {
  name: Roles;
  comment?: string;
  title?: string;
};

export const AuthUsers: AuthUser[] = [
  {
    username: 'publisher',
    password: 'Password1!2024',
  },
  {
    username: 'approver',
    password: 'Password1!2024',
  },
  {
    username: 'admin',
    password: 'Password1!2024',
  },
  {
    username: 'developer',
    password: 'Password1!2024',
  },
];

export const AuthRoles: AuthRole[] = [
  {
    name: Roles.PUBLISHER,
    comment: 'Publisher, can access and manage only the projects created by the user.',
    title: '普通用户',
  },
  { name: Roles.APPROVER, comment: 'Approver, can access and manager the projects.', title: '审批者' },
  { name: Roles.ADMIN, comment: 'Admin, can access and manager the users and projects.', title: '管理员' },
  { name: Roles.DEVELOPER, comment: 'Developer, can access and manager data created by the user.', title: '开发人员' },
];
