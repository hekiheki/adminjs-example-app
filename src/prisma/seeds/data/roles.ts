import { Roles } from '@prisma/client';
const roles = [{ name: Roles.USER }, { name: Roles.ADMIN }, { name: Roles.SUPER_ADMIN }];

export default roles;
