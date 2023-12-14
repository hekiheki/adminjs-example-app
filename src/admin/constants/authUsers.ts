import { Roles } from '@prisma/client';

export enum ROLE {
  PUBLISHER,
  APPROVER,
  ADMIN,
  DEVELOPER,
}

export type AuthUser = {
  username: string;
  password: string;
};

export type AuthRole = {
  name: Roles;
  comment?: string;
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
  { name: Roles.PUBLISHER, comment: 'Publisher, can access and manage only the projects created by the user.' },
  { name: Roles.APPROVER, comment: 'Approver, can access and manager the projects.' },
  { name: Roles.ADMIN, comment: 'Admin, can access and manager the users and projects.' },
  { name: Roles.DEVELOPER, comment: 'Developer, can access and manager data created by the user.' },
];
