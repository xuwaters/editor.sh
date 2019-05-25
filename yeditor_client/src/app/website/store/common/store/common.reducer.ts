import * as common from './common.action';
import { ApiErrorState, CommonState, ConfirmData, SnackBarMessage } from './common.model';

const initialCommonState = new CommonState();

export function commonStateReducer(state: CommonState = initialCommonState, action: common.CommonAction): CommonState {
  switch (action.type) {
    case common.CommonActionTypes.SnackBarMessage: {
      const msg = action as common.CommonActionSnackBarMessage;
      return state.with({ snackBarMessage: new SnackBarMessage(msg.payload) });
    }

    case common.CommonActionTypes.SnackBarMessageReset: {
      return state.with({ snackBarMessage: null });
    }

    case common.CommonActionTypes.ApiErrorState: {
      const msg = action as common.CommonActionApiErrorState;
      return state.with({ apiErrorState: new ApiErrorState(msg.payload) });
    }

    case common.CommonActionTypes.ApiErrorStateReset: {
      return state.with({ apiErrorState: null });
    }

    case common.CommonActionTypes.ConfirmDialog: {
      const msg = action as common.CommonActionConfirmDialog;
      return state.with({
        confirmData: msg.payload && new ConfirmData(msg.payload) || null
      });
    }

    default: {
      return state;
    }
  }
}
