import { buildFeature, FeatureType, ValidationError } from 'adminjs';

type ErrorMessage = Record<string, { message: string }>;

export const useFormValidate = (): FeatureType => {
  const formValidate = async (request, context) => {
    const { method, payload = {} } = request;
    const { resource, action, currentAdmin } = context;

    if (method !== 'post') return request;

    const errors: ErrorMessage = {};
    const { properties } = resource.decorate().toJSON(currentAdmin);
    const fields = Object.keys(properties).filter((key) => {
      return properties[key].custom?.required;
    });

    fields.forEach(async (key) => {
      const { custom = {}, resourceId } = properties[key];
      if (custom.required && !payload[key]) {
        errors[key] = {
          message: `${custom.title} 不能为空`,
        };
      }

      if (action.name === 'new' && custom.unique && payload[key]) {
        const isExist = await resource.client[resourceId].findFirst({
          where: {
            [key]: payload[key],
          },
        });
        if (isExist) {
          errors[key] = {
            message: `${custom.title} 已存在, 请重新输入`,
          };
        }
      }
    });

    if (Object.keys(errors).length) {
      throw new ValidationError(errors);
    }

    return request;
  };

  const moveFormErrors = async (response, request) => {
    const { payload } = request;
    if (response.record && response.record.errors && payload) {
      Object.keys(payload).forEach((key) => {
        if (response.record.errors[key]) {
          response.record.errors[key] = undefined;
        }
      });
    }
    return response;
  };

  return buildFeature({
    actions: {
      new: {
        before: [formValidate],
        after: [moveFormErrors],
      },
      edit: {
        before: [formValidate],
        after: [moveFormErrors],
      },
    },
  });
};
