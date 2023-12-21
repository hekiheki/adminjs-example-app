import { ActionResponse, After, Before, buildFeature, ComponentLoader, FeatureType, ValidationError } from 'adminjs';
import { ResetPasswordComponent } from '../components.bundler.js';

/**
 * Hashing function used to convert the password
 *
 * @alias HashingFunction
 * @memberof module:@adminjs/passwords
 * @returns {Promise<string> | string}
 */
export type HashingFunction = (
  /**
   * Password which should be hashed
   */
  password: string,
) => Promise<string> | string;

/**
 * Options passed to {@link module:@adminjs/passwords PasswordsFeature}
 *
 * @alias PasswordsOptions
 * @memberof module:@adminjs/passwords
 */
export type PasswordsOptions = {
  /**
   * Your ComponentLoader instance. It is required for the feature to add it's components.
   */
  componentLoader?: ComponentLoader;
  /**
   * Names of the properties used by the feature
   */
  properties?: {
    /**
     * Virtual property which will be seen by end user. Its value is not stored in the database.
     * Default to `password`
     */
    password?: string;
    /**
     * Property where encrypted password will be stored. Default to `encryptedPassword`
     */
    encryptedPassword?: string;
  };
  /**
   * Function used to hash the password. You can pass function from the external library
   * Example using [Argon2](https://www.npmjs.com/package/argon2).: `hash: argon2.hash`
   *
   */
  hash: HashingFunction;
};

export type Custom = {
  [T in keyof NonNullable<PasswordsOptions['properties']>]: NonNullable<T>;
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  return passwordRegex.test(password);
};

const passwordsFeature = (options: PasswordsOptions): FeatureType => {
  const passwordProperty = options.properties?.password || 'password';
  const encryptedPasswordProperty = options.properties?.encryptedPassword || 'encryptedPassword';
  const { hash } = options;

  if (!hash) {
    throw new Error('You have to pass "hash" option in "PasswordOptions" of "passwordsFeature"');
  }

  const encryptPassword: Before = async (request, context) => {
    const { method } = request;
    const { [passwordProperty]: newPassword, ...rest } = request.payload || {};
    const errors = {
      newPassword: {
        message:
          '密码必须满足以下条件：至少8个字符长，包含至少一个大写字母、一个小写字母、一个数字和一个特殊字符（!@#$%^&*）',
      },
    };

    if (context.action.name === 'new' && !newPassword) {
      throw new ValidationError(errors);
    }

    if (method === 'post' && newPassword) {
      const isValid = validatePassword(newPassword);
      if (!isValid) {
        throw new ValidationError(errors);
      }

      return {
        ...request,
        payload: {
          ...rest,
          [encryptedPasswordProperty]: await hash(newPassword),
        },
      };
    }
    return request;
  };

  const movePasswordErrors: After<ActionResponse> = async (response) => {
    if (response.record && response.record.errors && response.record.errors[encryptedPasswordProperty]) {
      response.record.errors[passwordProperty] = response.record.errors[encryptedPasswordProperty];
    }
    return response;
  };

  return buildFeature({
    properties: {
      [passwordProperty]: {
        custom: {
          password: passwordProperty,
          encryptedPassword: encryptedPasswordProperty,
        } as Custom,
        isVisible: { filter: false, show: false, edit: true, list: false },
        isRequired: true,
        components: {
          edit: ResetPasswordComponent,
        },
      },
      password: {
        isVisible: false,
      },
    },
    actions: {
      edit: {
        before: [encryptPassword],
        after: [movePasswordErrors],
      },
      new: {
        before: [encryptPassword],
        after: [movePasswordErrors],
      },
    },
  });
};

export default passwordsFeature;
