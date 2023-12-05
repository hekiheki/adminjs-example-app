import { RecordActionResponse, ActionRequest, flat } from 'adminjs';

const getManyReferences = (properties: any) => {
  return Object.entries(properties).filter(([name, { type, custom }]: any[]) => {
    return type === 'reference' && custom && custom.reference && custom.resourceId && custom.includeId;
  });
};

const fetchManyReferences = async (properties: any, recordId: number, client: any) => {
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

export const manyToManyReferencesAfterHook = async (
  response: RecordActionResponse,
  request: ActionRequest,
  context: any,
) => {
  const { method } = request;
  const { properties } = context.resource.decorate().toJSON(context.currentAdmin);
  const client = context.resource.client;
  const manyReferences = getManyReferences(properties);
  const recordId = response.record?.params?.id;
  if (method === 'get' && recordId) {
    const referenceResults = await fetchManyReferences(manyReferences, recordId, client);
    manyReferences.forEach(([name], index) => {
      response.record.params[name] = referenceResults[index];
    });
  }
  if (method === 'post' && context.record.isValid() && recordId) {
    await Promise.all(
      manyReferences.map(async ([name, { custom }]: [string, any]) => {
        const results = flat.unflatten(request.payload)[name].map((item) => Number(item.id));
        await client[custom.reference].deleteMany({
          where: {
            [custom.resourceId]: recordId,
          },
        });
        await client[custom.reference].createMany({
          data: results.map((val) => ({
            [custom.resourceId]: recordId,
            [custom.referenceId]: val,
          })),
        });
      }),
    );
  }
  return response;
};
