import { CommonState } from './common.model';
import { createSelector, createFeatureSelector } from '@ngrx/store';

export const selectCommonState = createFeatureSelector<CommonState>('common');

export const selectCommonStateSnackBarMessage = createSelector(
  selectCommonState,
  (state: CommonState) => state.snackBarMessage
);

export const selectCommonStateConfirmData = createSelector(
  selectCommonState,
  (state: CommonState) => state.confirmData
);

export const selectCommonStateApiErrorState = createSelector(
  selectCommonState,
  (state: CommonState) => state.apiErrorState
);
