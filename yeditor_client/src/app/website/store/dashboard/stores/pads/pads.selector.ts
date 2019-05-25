import { PadsState } from './pads.reducer';
import { createSelector } from '@ngrx/store';
import { selectDashboardState } from '../../reducers/dashboard.selector';
import { DashboardState } from '../../reducers/dashboard.reducer';

export const selectDashboardPadsState = createSelector(
  selectDashboardState,
  (state: DashboardState) => state.padsState
);

export const selectDashboardPadsStatePads = createSelector(
  selectDashboardPadsState,
  (state: PadsState) => state.pads
);

export const selectDashboardPadsStatePageSize = createSelector(
  selectDashboardPadsState,
  (state: PadsState) => state.pageSize
);

export const selectDashboardPadsStatePageIndex = createSelector(
  selectDashboardPadsState,
  (state: PadsState) => state.pageIndex
);

export const selectDashboardPadsStateFilters = createSelector(
  selectDashboardPadsState,
  (state: PadsState) => state.filters
);
