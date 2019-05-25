

/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UserLogin
// ====================================================

export interface UserLogin_user_login_session {
  token: string;
}

export interface UserLogin_user_login_user {
  id: number;
  email: string;
  name: string;
}

export interface UserLogin_user_login {
  session: UserLogin_user_login_session;
  user: UserLogin_user_login_user;
}

export interface UserLogin_user {
  login: UserLogin_user_login;
}

export interface UserLogin {
  user: UserLogin_user;
}

export interface UserLoginVariables {
  req: ApiReqUserLogin;
}


/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: UserOAuthQueryUrl
// ====================================================

export interface UserOAuthQueryUrl_user_oauthUrl {
  platform: string;
  authorizeUrl: string;
}

export interface UserOAuthQueryUrl_user {
  oauthUrl: UserOAuthQueryUrl_user_oauthUrl;
}

export interface UserOAuthQueryUrl {
  user: UserOAuthQueryUrl_user;
}

export interface UserOAuthQueryUrlVariables {
  req: ApiReqUserOAuthQueryUrl;
}


/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UserOAuthLogin
// ====================================================

export interface UserOAuthLogin_user_oauthLogin_session {
  token: string;
}

export interface UserOAuthLogin_user_oauthLogin_user {
  id: number;
  email: string;
  name: string;
}

export interface UserOAuthLogin_user_oauthLogin {
  session: UserOAuthLogin_user_oauthLogin_session;
  user: UserOAuthLogin_user_oauthLogin_user;
}

export interface UserOAuthLogin_user {
  oauthLogin: UserOAuthLogin_user_oauthLogin;
}

export interface UserOAuthLogin {
  user: UserOAuthLogin_user;
}

export interface UserOAuthLoginVariables {
  req: ApiReqUserOAuthLogin;
}


/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UserRegister
// ====================================================

export interface UserRegister_user_register_session {
  token: string;
}

export interface UserRegister_user_register_user {
  id: number;
  email: string;
  name: string;
}

export interface UserRegister_user_register {
  session: UserRegister_user_register_session;
  user: UserRegister_user_register_user;
}

export interface UserRegister_user {
  register: UserRegister_user_register;
}

export interface UserRegister {
  user: UserRegister_user;
}

export interface UserRegisterVariables {
  req: ApiReqUserRegister;
}


/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UserLogout
// ====================================================

export interface UserLogout_user {
  logout: number;  // returns user id
}

export interface UserLogout {
  user: UserLogout_user;
}


/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PadsQueryAll
// ====================================================

export interface PadsQueryAll_pads_all_pads {
  id: number;
  hash: string;
  title: string;
  status: string;
  creator: string;
  language: string;
  createTime: any;
  updateTime: any;
}

export interface PadsQueryAll_pads_all {
  pageIndex: number;
  pageSize: number;
  total: number;
  pads: PadsQueryAll_pads_all_pads[];
}

export interface PadsQueryAll_pads {
  all: PadsQueryAll_pads_all;
}

export interface PadsQueryAll {
  pads: PadsQueryAll_pads;
}

export interface PadsQueryAllVariables {
  req: ApiReqPadsQueryAll;
}


/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: PadsCreate
// ====================================================

export interface PadsCreate_pads_create_pad {
  id: number;
  hash: string;
  title: string;
  status: string;
  creator: string;
  language: string;
  createTime: any;
  updateTime: any;
}

export interface PadsCreate_pads_create {
  pad: PadsCreate_pads_create_pad;
}

export interface PadsCreate_pads {
  create: PadsCreate_pads_create;
}

export interface PadsCreate {
  pads: PadsCreate_pads;
}

export interface PadsCreateVariables {
  req: ApiReqPadsCreate;
}

/* tslint:disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

// user login request
export interface ApiReqUserLogin {
  email: string;
  password: string;
}

// user oauth login url query request
export interface ApiReqUserOAuthQueryUrl {
  platform: string;
}

// user oauth login request
export interface ApiReqUserOAuthLogin {
  platform: string;
  code: string;
}

// user register request
export interface ApiReqUserRegister {
  email: string;
  name: string;
  password: string;
  emailSubscription: boolean;
}

// pads query all request
export interface ApiReqPadsQueryAll {
  pageIndex: number;
  pageSize: number;
  filters: ApiReqPadsFilter;
}

// pads filter
export interface ApiReqPadsFilter {
  search?: string | null;
  status?: string | null;
  days?: string | null;
}

// pad create params
export interface ApiReqPadsCreate {
  title?: string | null;
  language?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================