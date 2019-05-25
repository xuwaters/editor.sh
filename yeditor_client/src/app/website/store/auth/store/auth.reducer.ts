import { ActionReducerMap } from '@ngrx/store';
import { LoginState, loginStateReducer } from './auth.reducer.state-login';
import { UserState, userStateReducer } from './auth.reducer.state-user';

// state
export interface AuthState {
  loginState: LoginState;
  userState: UserState;
}

// reducer
export const authStateReducer: ActionReducerMap<AuthState> = {
  loginState: loginStateReducer,
  userState: userStateReducer,
};
