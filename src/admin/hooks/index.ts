import { RecordActionResponse, ActionRequest, flat } from 'adminjs';

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
      payload.user = context.currentAdmin.id;
    }
  });
  return request;
};
