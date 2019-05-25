import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ApiErrorMessage } from '../../common/store/common.model';
import { AuthState } from './auth.reducer';
import { LoginState } from './auth.reducer.state-login';
import { UserState } from './auth.reducer.state-user';


// selector
export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuthLoginState = createSelector(
  selectAuthState,
  (state: AuthState) => state.loginState
);

export const selectAuthLoginStatePending = createSelector(
  selectAuthLoginState,
  (state: LoginState) => state.pending
);

export const selectAuthLoginStateErrors = createSelector(
  selectAuthLoginState,
  (state: LoginState) => state.errors
);

export const selectAuthLoginStateErrorsField = createSelector(
  selectAuthLoginStateErrors,
  (state: ApiErrorMessage[]) => (field: string) => {
    if (!state || state.length === 0) {
      return false;
    }
    for (let msg of state) {
      if (!msg.extensions) {
        continue;
      }
      let value = msg.extensions[field];
      if (value) {
        return value;
      }
    }
    return false;
  }
);

export const selectAuthUserState = createSelector(
  selectAuthState,
  (state: AuthState) => state.userState
);

export const selectAuthUserStateLoggedIn = createSelector(
  selectAuthUserState,
  (state: UserState) => state.loggedIn
);
