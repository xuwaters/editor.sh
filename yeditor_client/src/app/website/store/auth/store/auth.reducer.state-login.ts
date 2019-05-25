import { INIT } from '@ngrx/store';
import * as auth from './auth.action';
import * as immutable from 'immutable';
import { ApiErrorMessage } from '../../common/store/common.model';

export interface LoginStateParams {
  errors?: ApiErrorMessage[]; // '_default_' key or other fields key
  message?: string; // message for human
  pending?: boolean;
}

const initialLoginStateParams: LoginStateParams = {
  errors: null,
  message: '',
  pending: false,
};

export class LoginState extends immutable.Record(initialLoginStateParams) {
  readonly errors: ApiErrorMessage[]; // immutable.Map<string, string>;
  readonly message: string;
  readonly pending: boolean;

  constructor(params?: LoginStateParams) { params ? super(params) : super(); }
  with(values: LoginStateParams): LoginState { return this.merge(values) as this; }
}

const initialLoginState = new LoginState();

export function loginStateReducer(state: LoginState = initialLoginState, action: auth.AuthAction): LoginState {
  switch (action.type) {
    case INIT as auth.AuthActionTypes: {
      return state;
    }

    case auth.AuthActionTypes.Login: {
      return state.with({ pending: true });
    }

    case auth.AuthActionTypes.LoginSuccess: {
      return initialLoginState;
    }

    case auth.AuthActionTypes.LoginFailure: {
      const failure = action as auth.AuthActionLoginFailure;
      return state.with({ pending: false, errors: failure.payload.errors });
    }

    case auth.AuthActionTypes.Register: {
      return state.with({ pending: true });
    }

    case auth.AuthActionTypes.RegisterSuccess: {
      return initialLoginState;
    }

    case auth.AuthActionTypes.RegisterFailure: {
      const failure = action as auth.AuthActionRegisterFailure;
      return state.with({ pending: false, errors: failure.payload.errors });
    }

    default: {
      return state;
    }
  }
}
