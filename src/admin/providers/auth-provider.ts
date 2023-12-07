import { BaseAuthProvider, LoginHandlerOptions } from 'adminjs';
import { SessionData } from '@adminjs/express';

export class DefaultAuthProvider extends BaseAuthProvider {
  protected readonly authenticate;

  constructor({ authenticate }: any) {
    super();
    this.authenticate = authenticate;
  }

  override async handleLogin(opts: LoginHandlerOptions, context?: any) {
    const { data = {} } = opts;
    const { username, password } = data;
    return this.authenticate({ username, password }, context);
  }
}
