import { Action } from '@ngrx/store';
import { ApiErrorStateParams } from 'app/website/store/common/store/common.model';
import { Setting, SettingParams } from './settings.model';

export const enum SettingsActionTypes {
  Query = '@website/dashboard/settings/query',
  QuerySuccess = '@website/dashboard/settings/query-success',
  QueryFailure = '@website/dashboard/settings/query-failure',
  Save = '@website/dashboard/settings/save',
  SaveSuccess = '@website/dashboard/settings/save-success',
  SaveFailure = '@website/dashboard/settings/save-failure',
  RefreshApiKey = '@website/dashboard/settings/refresh-api-key',
  RefreshApiKeySuccess = '@website/dashboard/settings/refresh-api-key-success',
  RefreshApiKeyFailure = '@website/dashboard/settings/refresh-api-key-failure',
}

// query
export class SettingsActionQuery implements Action {
  readonly type = SettingsActionTypes.Query;
}

export class SettingsActionQuerySuccess implements Action {
  readonly type = SettingsActionTypes.QuerySuccess;
  constructor(public readonly payload: { setting: Setting }) { }
}

export class SettingsActionQueryFailure implements Action {
  readonly type = SettingsActionTypes.QueryFailure;
  constructor(public readonly payload: ApiErrorStateParams) { }
}

// save
export class SettingsActionSave implements Action {
  readonly type = SettingsActionTypes.Save;
  constructor(public readonly payload: { setting: SettingParams }) { }
}

export class SettingsActionSaveSuccess implements Action {
  readonly type = SettingsActionTypes.SaveSuccess;
  constructor(public readonly payload: { setting: Setting }) { }
}

export class SettingsActionSaveFailure implements Action {
  readonly type = SettingsActionTypes.SaveFailure;
  constructor(public readonly payload: ApiErrorStateParams) { }
}

// refresh api key
export class SettingsActionRefreshApiKey implements Action {
  readonly type = SettingsActionTypes.RefreshApiKey;
}

export class SettingsActionRefreshApiKeySuccess implements Action {
  readonly type = SettingsActionTypes.RefreshApiKeySuccess;
  constructor(public readonly payload: { api_key: string }) { }
}

export class SettingsActionRefreshApiKeyFailure implements Action {
  readonly type = SettingsActionTypes.RefreshApiKeyFailure;
  constructor(public readonly payload: ApiErrorStateParams) { }
}

// actions

export type SettingsAction =
  | SettingsActionQuery
  | SettingsActionQuerySuccess
  | SettingsActionQueryFailure
  | SettingsActionSave
  | SettingsActionSaveSuccess
  | SettingsActionSaveFailure
  | SettingsActionRefreshApiKey
  | SettingsActionRefreshApiKeySuccess
  | SettingsActionRefreshApiKeyFailure
  ;
