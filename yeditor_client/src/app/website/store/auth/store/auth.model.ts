import * as immutable from 'immutable';

export interface SessionParams {
  token?: string;
  scope?: string;
  expire?: number;
}

const initialSessionParams: SessionParams = {
  token: '',
  scope: '',
  expire: 0,
};

export class Session extends immutable.Record(initialSessionParams) {
  readonly token: string;
  readonly scope: string;
  readonly expire: number;

  constructor(params?: SessionParams) { params ? super(params) : super(); }
  with(params: SessionParams): Session { return this.merge(params) as this; }
}

export interface UserParams {
  id?: number;
  name?: string;
  email?: string;
}

const initialUserParams: UserParams = {
  id: 0,
  name: '',
  email: ''
};

export class User extends immutable.Record(initialUserParams) {
  readonly id: number;
  readonly name: string;
  readonly email: string;

  constructor(params?: UserParams) { params ? super(params) : super(); }
  with(params: UserParams): User { return this.merge(params) as this; }
}

export interface Authentication {
  email: string;
  password: string;
}

export interface Registration {
  email: string;
  name: string;
  password: string;
  options: {
    email_subscription: boolean,
  };
}

export interface OAuthLoginParams {
  platform: string;
  code: string;
}

export interface OAuthUrlParams {
  platform: string;
  authorize_url: string;
}
