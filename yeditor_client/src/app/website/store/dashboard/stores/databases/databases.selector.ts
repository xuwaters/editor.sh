import { DatabasesState } from './databases.reducer';

import { createSelector } from '@ngrx/store';
import { selectDashboardState } from '../../reducers/dashboard.selector';
import { DashboardState } from '../../reducers/dashboard.reducer';

export const selectDashboardDatabasesState = createSelector(
  selectDashboardState,
  (state: DashboardState) => state.databasesState
);

export const selectDashboardDatabasesStateAllDatabases = createSelector(
  selectDashboardDatabasesState,
  (state: DatabasesState) => state.databases,
);
