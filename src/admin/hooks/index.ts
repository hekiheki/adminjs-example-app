import { RecordActionResponse, ActionRequest, ActionContext, ResourceOptions, flat } from 'adminjs';

export const manyToManyReferencesAfterHook = async (
  response: RecordActionResponse,
  request: ActionRequest,
  context: ActionContext,
) => {
  const recordId = response.record.params.id;
  const { method } = request;
  const { properties } = context.resource.decorate().toJSON(context.currentAdmin);
  const client = context.resource.client;
  const manyReferences = Object.entries(properties).filter(([name, { type, custom }]: [string, ResourceOptions]) => {
    return type === 'reference' && custom && custom.reference && custom.resourceId && custom.includeId;
  });
  if (method === 'get' && context.action.name !== 'new') {
    const results = await Promise.all(
      manyReferences.map(async ([name, { custom }]: [string, any]) => {
        const userRoles = await client[custom.reference].findMany({
          where: {
            [custom.resourceId]: recordId,
          },
          include: {
            [custom.includeId]: true,
          },
        });
        return userRoles.length ? userRoles.map((r) => r[custom.includeId]) : [];
      }),
    );
    manyReferences.forEach(([name], index) => {
      response.record.params[name] = results[index];
    });
  }
  if (method === 'post' && context.record.isValid()) {
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
