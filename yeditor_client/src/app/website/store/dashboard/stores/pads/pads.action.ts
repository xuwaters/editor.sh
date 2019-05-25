import { ApiErrorStateParams } from 'app/website/store/common/store/common.model';
import { Action } from '@ngrx/store';
import { Pad, PadsFilters } from './pads.model';

export const enum PadsActionTypes {
  QueryAll = '@website/dashboard/pads/query-all',
  QueryAllSuccess = '@website/dashboard/pads/query-all-success',
  QueryAllFailure = '@website/dashboard/pads/query-all-failure',
  FilterChange = '@website/dashboard/pads/filter-change',
  PageChange = '@website/dashboard/pads/page-change',
  CreatePad = '@website/dashboard/pads/create-pad',
  CreatePadSuccess = '@website/dashboard/pads/create-pad-success',
  CreatePadFailure = '@website/dashboard/pads/create-pad-failure',
  GotoPadHash = '@website/dashboard/pads/goto-pad-hash',
}

export class PadsActionQueryAll implements Action {
  readonly type = PadsActionTypes.QueryAll;
  constructor(public readonly payload: {
    pageIndex: number,
    pageSize: number,
    filters: PadsFilters,
  }) { }
}

export class PadsActionQueryAllSuccess implements Action {
  readonly type = PadsActionTypes.QueryAllSuccess;
  constructor(public readonly payload: {
    pads: Pad[],
    pageIndex: number,
    pageSize: number,
    total: number,
  }) { }
}

export class PadsActionQueryAllFailure implements Action {
  readonly type = PadsActionTypes.QueryAllFailure;
  constructor(public readonly payload: ApiErrorStateParams) { }
}

export class PadsActionFilterChange implements Action {
  readonly type = PadsActionTypes.FilterChange;
  constructor(public readonly payload: PadsFilters) { }
}

export class PadsActionPageChange implements Action {
  readonly type = PadsActionTypes.PageChange;
  constructor(public readonly payload: { pageIndex: number, pageSize: number }) { }
}

export class PadsActionCreatePad implements Action {
  readonly type = PadsActionTypes.CreatePad;
  constructor(public readonly payload: { title?: string, language?: string }) { }
}

export class PadsActionCreatePadSuccess implements Action {
  readonly type = PadsActionTypes.CreatePadSuccess;
  constructor(public readonly payload: {
    pad: Pad,
  }) { }
}

export class PadsActionCreatePadFailure implements Action {
  readonly type = PadsActionTypes.CreatePadFailure;
  constructor(public readonly payload: ApiErrorStateParams) { }
}

export class PadsActionGotoPadHash implements Action {
  readonly type = PadsActionTypes.GotoPadHash;
  constructor(public readonly payload: { hash: String }) { }
}

export type PadsAction =
  | PadsActionQueryAll
  | PadsActionQueryAllSuccess
  | PadsActionQueryAllFailure
  | PadsActionFilterChange
  | PadsActionPageChange
  | PadsActionCreatePad
  | PadsActionCreatePadSuccess
  | PadsActionCreatePadFailure
  | PadsActionGotoPadHash
  ;
