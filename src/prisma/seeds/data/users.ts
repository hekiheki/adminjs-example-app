import { faker } from '@faker-js/faker';

const users = (count: number) =>
  Array.from({ length: count }, () => ({
    username: faker.company.name(),
    password: faker.internet.password(),
  }));

export default users;
