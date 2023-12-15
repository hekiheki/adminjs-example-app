import { RecordActionResponse, ActionRequest, flat, NotFoundError } from 'adminjs';
import { client } from '../../prisma/config.js';

const getReferencesProperties = (properties: any) => {
  return Object.entries(properties).filter(([name, { type, custom }]: any[]) => {
    return type === 'reference' && custom && custom.reference && custom.resourceId && custom.includeId;
  });
};

const fetchReferencesValues = async (properties: any, recordId: number, client: any) => {
  const results = await Promise.all(
    properties.map(async ([name, { custom }]: [string, any]) => {
      const records = await client[custom.reference].findMany({
        where: {
          [custom.resourceId]: recordId,
        },
        include: {
          [custom.includeId]: true,
        },
      });
      return records.length ? records.map((r) => r[custom.includeId]) : [];
    }),
  );
  return results;
};

export const getManyToManyReferencesValuesAfterHook = async (
  response: RecordActionResponse,
  request: ActionRequest,
  context: any,
) => {
  const { method } = request;
  const { properties } = context.resource.decorate().toJSON(context.currentAdmin);
  const client = context.resource.client;
  const referencesProperties = getReferencesProperties(properties);
  const recordId = response.record?.params?.id;
  if (method === 'get' && recordId) {
    const referenceValues = await fetchReferencesValues(referencesProperties, recordId, client);
    referencesProperties.forEach(([name]: any[], index) => {
      response.record.params[name] = referenceValues[index];
      console.log(response.record.params[name]);
    });
  }
  return response;
};

export const postManyToManyReferencesValuesAfterHook = async (
  response: RecordActionResponse,
  request: ActionRequest,
  context: any,
) => {
  const { method } = request;
  const { properties } = context.resource.decorate().toJSON(context.currentAdmin);
  const client = context.resource.client;
  const referencesProperties = getReferencesProperties(properties);
  const recordId = response.record?.params?.id;
  const payload = flat.unflatten(request.payload);

  if (method === 'post' && context.record.isValid() && recordId) {
    await Promise.all(
      referencesProperties.map(async ([name, { custom }]: [string, any]) => {
        await client[custom.reference].deleteMany({
          where: {
            [custom.resourceId]: recordId,
          },
        });
        if (!payload[name]) return;
        const data = payload[name].map(({ id }) => {
          return {
            [custom.resourceId]: recordId,
            [custom.referenceId]: Number(id),
          };
        });
        if (data.length) {
          await client[custom.reference].createMany({
            data,
          });
        }
      }),
    );
  }
  return response;
};

export const defaultValuesBeforeHook = async (request, context) => {
  const { payload, method } = request;
  if (method !== 'post' || !payload || context.action.name !== 'new') {
    return request;
  }
  const { properties } = context.resource.decorate().toJSON(context.currentAdmin);
  Object.entries(properties).forEach(([name, { custom }]: any[]) => {
    if (custom.defaultValue && payload[name] === undefined) {
      payload[name] = custom.defaultValue;
    }
  });
  return request;
};

export const getUserRolesHook = async (request, context) => {
  const { method, payload } = request;
  const { record, action } = context;
  if (!record) {
    throw new NotFoundError(
      [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
      'Action#handler',
    );
  }
  if (method !== 'post' || !payload || action.name !== 'new') {
    const userRoles = await client.userRoles.findMany({
      where: {
        userId: record.id(),
      },
      include: {
        role: true,
      },
    });
    record.params.roles = userRoles?.map(({ role }) => role) || [];
  }
  return request;
};

export const postUserRolesHook = async (request, context) => {
  const { method, payload } = request;
  const { record } = context;
  if (!record) {
    throw new NotFoundError(
      [`Record of given id ("${request.params.recordId}") could not be found`].join('\n'),
      'Action#handler',
    );
  }
  if (method !== 'post' || !payload) {
    return request;
  }
  const roles = flat.unflatten(payload)?.roles || [];
  if (roles && roles.length) {
    const data = roles.map(({ id }) => {
      return {
        userId: record.id(),
        roleId: Number(id),
      };
    });
    await client.userRoles.deleteMany({
      where: {
        userId: record.id(),
      },
    });

    await client.userRoles.createMany({
      data,
    });
  }

  return request;
};

export const createUserRolesHook = async (response, request, context) => {
  const { method, payload } = request;
  if (method !== 'post' || !payload) {
    return request;
  }
  const userId = response.record?.params?.id;
  if (context.record.isValid() && userId) {
    const roles = flat.unflatten(payload)?.roles || [];
    if (roles && roles.length) {
      const data = roles.map(({ id }) => {
        return {
          userId,
          roleId: Number(id),
        };
      });
      await client.userRoles.createMany({
        data,
      });
    }
  }

  return response;
};
