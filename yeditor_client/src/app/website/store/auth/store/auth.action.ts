import { ApiErrorStateParams } from '../../common/store/common.model';
import { UserParams, Authentication, SessionParams, Registration, OAuthLoginParams, OAuthUrlParams } from './auth.model';
import { Action } from '@ngrx/store';

export const enum AuthActionTypes {
  Login = '@website/auth/login',
  LoginSuccess = '@website/auth/login-success',
  LoginFailure = '@website/auth/login-failure',
  LoginRedirect = '@website/auth/login-redirect',
  Logout = '@website/auth/logout',
  LogoutSuccess = '@website/auth/logout-success',
  LogoutFailure = '@website/auth/logout-failure',
  Register = '@website/auth/register',
  RegisterSuccess = '@website/auth/register-success',
  RegisterFailure = '@website/auth/register-failure',
  RefreshToken = '@website/auth/refresh-token',
  RefreshTokenSuccess = '@website/auth/refresh-token-success',
  RefreshTokenFailure = '@website/auth/refresh-token-failure',
  LoadTokenSuccess = '@website/auth/load-token-success',
  OAuthQueryUrl = '@website/auth/oauth-query-url',
  OAuthQueryUrlSuccess = '@website/auth/oauth-query-url-success',
  OAuthQueryUrlFailure = '@website/auth/oauth-query-url-failure',
  OAuthLogin = '@website/auth/oauth-login',
  OAuthLoginSuccess = '@website/auth/oauth-login-success',
  OAuthLoginFailure = '@website/auth/oauth-login-failure',
}

export class AuthActionLogin implements Action {
  readonly type = AuthActionTypes.Login;

  constructor(public readonly payload: Authentication) { }
}

export class AuthActionLoginSuccess implements Action {
  readonly type = AuthActionTypes.LoginSuccess;

  constructor(public readonly payload: {
    user: UserParams, session: SessionParams
  }) { }
}

export class AuthActionLoginFailure implements Action {
  readonly type = AuthActionTypes.LoginFailure;

  constructor(public readonly payload: ApiErrorStateParams) { }
}

// redirect to login page
export class AuthActionLoginRedirect implements Action {
  readonly type = AuthActionTypes.LoginRedirect;
}

export class AuthActionLogout implements Action {
  readonly type = AuthActionTypes.Logout;
}

export class AuthActionLogoutSuccess implements Action {
  readonly type = AuthActionTypes.LogoutSuccess;
}

export class AuthActionLogoutFailure implements Action {
  readonly type = AuthActionTypes.LogoutFailure;
}

export class AuthActionRegister implements Action {
  readonly type = AuthActionTypes.Register;

  constructor(public readonly payload: Registration) { }
}

export class AuthActionRegisterSuccess implements Action {
  readonly type = AuthActionTypes.RegisterSuccess;

  constructor(public readonly payload: {
    user: UserParams, session: SessionParams
  }) { }
}

export class AuthActionRegisterFailure implements Action {
  readonly type = AuthActionTypes.RegisterFailure;

  constructor(public readonly payload: ApiErrorStateParams) { }
}


export class AuthActionRefreshToken implements Action {
  readonly type = AuthActionTypes.RefreshToken;

  constructor(public readonly payload: {
  }) { }
}

export class AuthActionRefreshTokenSuccess implements Action {
  readonly type = AuthActionTypes.RefreshTokenSuccess;

  constructor(public readonly payload: {
    user: UserParams, session: SessionParams
  }) { }
}

export interface RefreshTokenErrorStateParams extends ApiErrorStateParams {
  redirect?: string;
}

export class AuthActionRefreshTokenFailure implements Action {
  readonly type = AuthActionTypes.RefreshTokenFailure;

  constructor(public readonly payload: RefreshTokenErrorStateParams) { }
}

export class AuthActionLoadTokenSuccess implements Action {
  readonly type = AuthActionTypes.LoadTokenSuccess;

  constructor(public readonly payload: {
    session: SessionParams
  }) { }
}

export class AuthActionOAuthQueryUrl implements Action {
  readonly type = AuthActionTypes.OAuthQueryUrl;
  constructor(public readonly payload: { platform: string }) { }
}

export class AuthActionOAuthQueryUrlSuccess implements Action {
  readonly type = AuthActionTypes.OAuthQueryUrlSuccess;
  constructor(public readonly payload: OAuthUrlParams) { }
}

export class AuthActionOAuthQueryUrlFailure implements Action {
  readonly type = AuthActionTypes.OAuthQueryUrlFailure;
  constructor(public readonly payload: ApiErrorStateParams) { }
}

export class AuthActionOAuthLogin implements Action {
  readonly type = AuthActionTypes.OAuthLogin;

  constructor(public readonly payload: OAuthLoginParams) { }
}

export class AuthActionOAuthLoginSuccess implements Action {
  readonly type = AuthActionTypes.OAuthLoginSuccess;

  constructor(public readonly payload: {
    user: UserParams,
    session: SessionParams,
  }) { }
}

export class AuthActionOAuthLoginFailure implements Action {
  readonly type = AuthActionTypes.OAuthLoginFailure;

  constructor(public readonly payload: ApiErrorStateParams) { }
}

//////////////////

export type AuthAction =
  | AuthActionLogin
  | AuthActionLoginSuccess
  | AuthActionLoginFailure
  | AuthActionLoginRedirect
  | AuthActionLogout
  | AuthActionLogoutSuccess
  | AuthActionLogoutFailure
  | AuthActionRegister
  | AuthActionRegisterSuccess
  | AuthActionRegisterFailure
  | AuthActionRefreshToken
  | AuthActionRefreshTokenSuccess
  | AuthActionRefreshTokenFailure
  | AuthActionLoadTokenSuccess
  | AuthActionOAuthQueryUrl
  | AuthActionOAuthQueryUrlSuccess
  | AuthActionOAuthQueryUrlFailure
  | AuthActionOAuthLogin
  | AuthActionOAuthLoginSuccess
  | AuthActionOAuthLoginFailure
  ;
