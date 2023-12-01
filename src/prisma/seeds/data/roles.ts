import { faker } from '@faker-js/faker';

const roles = (count: number) =>
  Array.from({ length: count }, () => ({
    name: faker.helpers.arrayElement(['USER', 'ADMIN', 'SUPER_ADMIN']) as any,
  }));

export default roles;
