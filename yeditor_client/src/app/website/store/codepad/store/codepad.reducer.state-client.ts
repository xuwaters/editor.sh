import * as actions from './codepad.action';
import * as immutable from 'immutable';

export enum ConnectStatus {
  none = 'none',
  connecting = 'connecting',
  connected = 'connected',
  disconnecting = 'disconnecting',
  closed = 'closed',
}

export interface ClientStateParams {
  padHash?: string;
  connectStatus?: ConnectStatus;
}

const initialClientStateParams: ClientStateParams = {
  padHash: '',
  connectStatus: ConnectStatus.none,
};

export class ClientState extends immutable.Record(initialClientStateParams) {
  readonly padHash: string;
  readonly connectStatus: ConnectStatus;

  constructor(params?: ClientStateParams) { params ? super(params) : super(); }
  with(params: ClientStateParams): ClientState { return this.merge(params) as this; }
}

const initialState = new ClientState();

export function clientStateReducer(state: ClientState = initialState, action: actions.CodepadAction): ClientState {
  switch (action.type) {
    case actions.CodepadActionTypes.Connect: {
      if (state.connectStatus === ConnectStatus.none || state.connectStatus === ConnectStatus.closed) {
        let msg = action as actions.CodepadActionConnect;
        return state.with({
          padHash: msg.payload.padHash,
          connectStatus: ConnectStatus.connecting,
        });
      } else {
        return state;
      }
    }
    case actions.CodepadActionTypes.ConnectFailure: {
      if (state.connectStatus === ConnectStatus.connecting) {
        return state.with({
          connectStatus: ConnectStatus.closed,
        });
      } else {
        return state;
      }
    }
    case actions.CodepadActionTypes.ConnectSuccess: {
      if (state.connectStatus === ConnectStatus.connecting) {
        return state.with({
          connectStatus: ConnectStatus.connected,
        });
      } else {
        return state;
      }
    }
    case actions.CodepadActionTypes.Disconnect: {
      if (state.connectStatus === ConnectStatus.connecting || state.connectStatus === ConnectStatus.connected) {
        return state.with({
          connectStatus: ConnectStatus.disconnecting,
        });
      } else {
        return state;
      }
    }
    case actions.CodepadActionTypes.Closed: {
      return state.with({
        connectStatus: ConnectStatus.closed,
      });
    }
    default: {
      return state;
    }
  }
}
