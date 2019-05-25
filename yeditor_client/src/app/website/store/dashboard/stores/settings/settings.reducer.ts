import { Setting } from './settings.model';
import * as actions from './settings.action';
import * as immutable from 'immutable';

export interface SettingsStateParams {
  setting?: Setting;
}

const initialSettingsStateParams: SettingsStateParams = {
  setting: null,
};

export class SettingsState extends immutable.Record(initialSettingsStateParams) {
  readonly setting: Setting;

  constructor(params?: SettingsStateParams) { params ? super(params) : super(); }
  with(values: SettingsStateParams): SettingsState { return this.merge(values) as this; }
}

const initialSettingsState = new SettingsState();

export function settingsStateReducer(state: SettingsState = initialSettingsState, action: actions.SettingsAction): SettingsState {
  switch (action.type) {
    case actions.SettingsActionTypes.QuerySuccess: {
      const msg = action as actions.SettingsActionQuerySuccess;
      const setting = msg.payload.setting || null;
      return state.with({
        setting: setting
      });
    }

    case actions.SettingsActionTypes.SaveSuccess: {
      const msg = action as actions.SettingsActionSaveSuccess;
      const setting = msg.payload.setting || null;
      return state.with({
        setting: setting
      });
    }

    case actions.SettingsActionTypes.RefreshApiKeySuccess: {
      const msg = action as actions.SettingsActionRefreshApiKeySuccess;
      const api_key = msg.payload.api_key;
      const setting = state.setting.with({ api_key: api_key });
      return state.with({ setting: setting });
    }

    default: {
      return state;
    }
  }
}
