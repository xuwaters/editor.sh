import { SettingsState } from './settings.reducer';

import { createSelector } from '@ngrx/store';
import { selectDashboardState } from '../../reducers/dashboard.selector';
import { DashboardState } from '../../reducers/dashboard.reducer';

export const selectDashboardSettingsState = createSelector(
  selectDashboardState,
  (state: DashboardState) => state.settingsState
);

export const selectDashboardSettingsStateSetting = createSelector(
  selectDashboardSettingsState,
  (state: SettingsState) => state.setting
);
