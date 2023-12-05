export type AuthUser = {
  username: string;
  password: string;
};

export const AuthUsers: AuthUser[] = [
  {
    username: 'admin',
    password: '123456',
  },
  {
    username: 'user',
    password: '123456',
  },
  {
    username: 'super_admin',
    password: '123456',
  },
];
