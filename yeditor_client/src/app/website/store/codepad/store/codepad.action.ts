import { Action } from '@ngrx/store';
import { CodepadClient } from 'app/website/shared/services/codepad/codepad.service';
import { CodepadInitParams } from './codepad.model';

export const enum CodepadActionTypes {
  Connect = '@website/codepad/connect',
  ConnectFailure = '@website/codepad/connect-failure',
  ConnectSuccess = '@website/codepad/connect-success',
  Load = '@website/codepad/load',
  LoadFailure = '@website/codepad/load-failure',
  LoadSuccess = '@website/codepad/load-success',
  Disconnect = '@website/codepad/disconnect',
  Closed = '@website/codepad/closed',
  LanguageChanged = '@website/codepad/language-changed',
}

export class CodepadActionConnect implements Action {
  readonly type = CodepadActionTypes.Connect;
  constructor(public readonly payload: {
    padHash: string,
    onCreated: (client: CodepadClient) => void,
  }) { }
}

export class CodepadActionConnectFailure implements Action {
  readonly type = CodepadActionTypes.ConnectFailure;
}
export class CodepadActionConnectSuccess implements Action {
  readonly type = CodepadActionTypes.ConnectSuccess;
}

export class CodepadActionLoad implements Action {
  readonly type = CodepadActionTypes.Load;
}

export class CodepadActionLoadFailure implements Action {
  readonly type = CodepadActionTypes.LoadFailure;
  constructor(public readonly payload: { message: string }) { }
}

export class CodepadActionLoadSuccess implements Action {
  readonly type = CodepadActionTypes.LoadSuccess;
  constructor(public readonly payload: CodepadInitParams) { }
}

export class CodepadActionDisconnect implements Action {
  readonly type = CodepadActionTypes.Disconnect;
}

export class CodepadActionClosed implements Action {
  readonly type = CodepadActionTypes.Closed;
}

export class CodepadActionLanguageChanged implements Action {
  readonly type = CodepadActionTypes.LanguageChanged;
  constructor(public readonly payload: { language: string }) { }
}

export type CodepadAction =
  | CodepadActionConnect
  | CodepadActionConnectFailure
  | CodepadActionConnectSuccess
  | CodepadActionLoad
  | CodepadActionLoadFailure
  | CodepadActionLoadSuccess
  | CodepadActionDisconnect
  | CodepadActionClosed
  | CodepadActionLanguageChanged
  ;
