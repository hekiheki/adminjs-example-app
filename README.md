## AdminJS-example-app

Example application using [adminjs](https://github.com/SoftwareBrothers/adminjs)

## Prerequisites

Install Docker if you don't have it: https://docs.docker.com/desktop/#download-and-install

Run:
```bash
$ docker-compose up -d
```
to setup databases.

Make sure your `.env` file is configured. If you didn't do any changes to `docker-compose.yml` file,
the default contents of the `.env` file should work for you.

## Starting the app

First, install all dependencies

```bash
yarn install --frozen-lockfile
```

Make sure you have all environmental variables set up (read the previous paragraph).

Then create postgres database and run migrations:

```bash
$ npx prisma generate     # # this sets up Prisma Client in your node_modules
$ yarn migration:up
```

Note: If you see the error below when Prisma MySQL migration is run:
```
Error: P1017: Server has closed the connection.
```
Please wait a minute or two for the MySQL server to start and retry.

In the end, you can launch the app

```bash
$ yarn build:watch      # keep it running if developing
$ yarn start:dev        # in a separate terminal tab, concurrently
```

By default the app will be available under: `http://localhost:3000/`

## Developing the app

The best way of developing the app is to do this via https://github.com/SoftwareBrothers/adminjs-dev.

Alternatively, you can fork and clone each repository separately and link them using:

* `yarn link`
* `npm link`

to see your local changes.
## License

AdminJS is copyrighted © 2023 rst.software. It is a free software, and may be redistributed under the terms specified in the [LICENSE](LICENSE.md) file.
