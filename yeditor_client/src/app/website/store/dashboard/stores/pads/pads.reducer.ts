import { Pad, PadsFilters } from './pads.model';
import * as immutable from 'immutable';
import {
  PadsAction, PadsActionTypes, PadsActionQueryAllSuccess, PadsActionFilterChange,
  PadsActionPageChange,
} from './pads.action';

export interface PadsStateParams {
  pads?: immutable.List<Pad>;
  pageSize?: number;
  pageIndex?: number;
  total?: number;
  filters?: PadsFilters; // immutable.Map<string, string>;
}

const initialPadsStateParams: PadsStateParams = {
  pads: immutable.List<Pad>(),
  pageSize: 0,
  pageIndex: 0,
  total: 0,
  filters: {}, // immutable.Map<string, string>(),
};

export class PadsState extends immutable.Record(initialPadsStateParams) {
  readonly pads: immutable.List<Pad>;
  readonly pageSize: number;
  readonly pageIndex: number;
  readonly total: number;
  readonly filters: PadsFilters; // immutable.Map<string, string>;

  constructor(params?: PadsStateParams) { params ? super(params) : super(); }
  with(values: PadsStateParams): PadsState { return this.merge(values) as this; }
}

const initialPadsState = new PadsState();

export function padsStateReducer(state: PadsState = initialPadsState, action: PadsAction): PadsState {
  switch (action.type) {
    case PadsActionTypes.QueryAllSuccess: {
      const msg = action as PadsActionQueryAllSuccess;
      const payload = msg.payload;
      return state.with({
        pads: immutable.List<Pad>(payload.pads || []),
        pageSize: payload.pageSize || 0,
        pageIndex: payload.pageIndex || 0,
        total: payload.total || 0,
      });
    }

    case PadsActionTypes.FilterChange: {
      const msg = action as PadsActionFilterChange;
      const payload = msg.payload;
      return state.with({
        filters: payload || {},
      });
    }

    case PadsActionTypes.PageChange: {
      const msg = action as PadsActionPageChange;
      const payload = msg.payload;
      return state.with({
        pageIndex: payload.pageIndex,
        pageSize: payload.pageSize,
      });
    }

    default: {
      return state;
    }
  }
}
