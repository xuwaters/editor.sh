import * as immutable from 'immutable';
import { Action, INIT } from '@ngrx/store';

import * as auth from './auth.action';
import { User, Session } from './auth.model';

export interface UserStateParams {
  loggedIn?: boolean;
  user?: User;
  session?: Session;
}

const initialUserStateParams: UserStateParams = {
  loggedIn: false,
  user: null,
  session: null,
};

export class UserState extends immutable.Record(initialUserStateParams) {
  readonly loggedIn: boolean;
  readonly user: User;
  readonly session: Session;

  constructor(params?: UserStateParams) { params ? super(params) : super(); }
  with(values: UserStateParams): UserState { return this.merge(values) as this; }
}

const initialUserState = new UserState();

export function userStateReducer(state: UserState = initialUserState, action: auth.AuthAction): UserState {
  switch (action.type) {
    case INIT as auth.AuthActionTypes: {
      return state;
    }

    case auth.AuthActionTypes.LoadTokenSuccess: {
      const msg = action as auth.AuthActionLoadTokenSuccess;
      const stateParams: UserStateParams = {
        loggedIn: true,
        session: new Session(msg.payload.session),
      };
      return state.with(stateParams);
    }

    case auth.AuthActionTypes.LogoutSuccess: {
      return initialUserState;
    }

    case auth.AuthActionTypes.LoginSuccess: {
      const loginSuccess = action as auth.AuthActionLoginSuccess;
      const stateParams = <UserStateParams>{
        loggedIn: true,
        user: new User(loginSuccess.payload.user),
        session: new Session(loginSuccess.payload.session),
      };
      return state.with(stateParams);
    }

    case auth.AuthActionTypes.RefreshTokenSuccess: {
      const loginSuccess = action as auth.AuthActionRefreshTokenSuccess;
      const stateParams = <UserStateParams>{
        loggedIn: true,
        user: new User(loginSuccess.payload.user),
        session: new Session(loginSuccess.payload.session),
      };
      return state.with(stateParams);
    }

    case auth.AuthActionTypes.RegisterSuccess: {
      const registerSuccess = action as auth.AuthActionRegisterSuccess;
      const stateParams = <UserStateParams>{
        loggedIn: true,
        user: new User(registerSuccess.payload.user),
        session: new Session(registerSuccess.payload.session),
      };
      return state.with(stateParams);
    }

    case auth.AuthActionTypes.OAuthLoginSuccess: {
      const loginSuccess = action as auth.AuthActionOAuthLoginSuccess;
      const stateParams = <UserStateParams>{
        loggedIn: true,
        user: new User(loginSuccess.payload.user),
        session: new Session(loginSuccess.payload.session),
      };
      return state.with(stateParams);
    }

    default: {
      return state;
    }
  }
}
