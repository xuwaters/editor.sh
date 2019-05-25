import { SnackBarMessageParams, ApiErrorStateParams, ConfirmDataParams } from './common.model';
import { Action } from '@ngrx/store';

export enum CommonActionTypes {
  SnackBarMessage = '@website/common/snack-bar-message',
  SnackBarMessageReset = '@website/common/snack-bar-message-reset',
  ApiErrorState = '@website/common/api-error-state',
  ApiErrorStateReset = '@website/common/api-error-state-reset',
  ApiUnauthorizedAccess = '@website/common/api-unauthorized-access',
  ConfirmDialog = '@website/common/confirm-dialog',
}

export class CommonActionSnackBarMessage implements Action {
  readonly type = CommonActionTypes.SnackBarMessage;
  constructor(public readonly payload: SnackBarMessageParams) { }
}

export class CommonActionSnackBarMessageReset implements Action {
  readonly type = CommonActionTypes.SnackBarMessageReset;
}

export class CommonActionApiErrorState implements Action {
  readonly type = CommonActionTypes.ApiErrorState;
  constructor(public readonly payload: ApiErrorStateParams) { }
}

export class CommonActionApiErrorStateReset implements Action {
  readonly type = CommonActionTypes.ApiErrorStateReset;
}

export class CommonActionApiUnauthorizedAccess implements Action {
  readonly type = CommonActionTypes.ApiUnauthorizedAccess;
}

export class CommonActionConfirmDialog implements Action {
  readonly type = CommonActionTypes.ConfirmDialog;
  constructor(public readonly payload: ConfirmDataParams) { }
}

export type CommonAction =
  | CommonActionSnackBarMessage
  | CommonActionSnackBarMessageReset
  | CommonActionApiErrorState
  | CommonActionApiErrorStateReset
  | CommonActionApiUnauthorizedAccess
  | CommonActionConfirmDialog
  ;
