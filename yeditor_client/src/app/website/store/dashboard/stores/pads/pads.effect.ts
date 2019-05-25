import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as api from 'app/website/shared/models/api.model';
import { GraphQLService } from 'app/website/shared/services/api/graphql.service';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import 'rxjs/add/operator/withLatestFrom';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';
import * as pads from './pads.action';
import { Pad } from './pads.model';
import { selectDashboardPadsState } from './pads.selector';
import { CommonActionSnackBarMessage } from 'app/website/store/common';


@Injectable()
export class PadsEffect {

  constructor(
    private actions$: Actions,
    private store$: Store<WebsiteState>,
    private graphqlService: GraphQLService,
    private logger: LoggerService,
    private router: Router,
  ) { }

  @Effect()
  createPad$ = this.actions$.pipe(
    ofType(pads.PadsActionTypes.CreatePad),
    switchMap((it: pads.PadsActionCreatePad) => {
      const payload = it.payload;
      const req: api.ReqPadsCreate = {
        pad: {}
      };
      return this.graphqlService.padsCreate(req).map(resp => {
        const data = resp.data;
        return new pads.PadsActionCreatePadSuccess({ pad: new Pad(data) });
      }).catch((resp: HttpErrorResponse) => {
        const data = resp.error;
        const message = data && data[0] && data[0].message || 'Pad create failure';
        this.store$.dispatch(new CommonActionSnackBarMessage({ message: message }));
        return of(new pads.PadsActionCreatePadFailure(data));
      });
    })
  );

  @Effect({ dispatch: false })
  createPadSuccess$ = this.actions$.pipe(
    ofType(pads.PadsActionTypes.CreatePadSuccess),
    tap((it: pads.PadsActionCreatePadSuccess) => {
      this.logger.log('pad created =', it.payload);
      let pad = it.payload.pad;
      this.store$.dispatch(new pads.PadsActionGotoPadHash({ hash: pad.hash }));
    })
  );

  @Effect({ dispatch: false })
  gotoPadHash$ = this.actions$.pipe(
    ofType(pads.PadsActionTypes.GotoPadHash),
    tap((it: pads.PadsActionGotoPadHash) => {
      let hash = it.payload.hash;
      this.router.navigate(['/' + hash]);
    })
  );

  @Effect()
  queryAllPads$ = this.actions$.pipe(
    ofType(pads.PadsActionTypes.QueryAll),
    switchMap((it: pads.PadsActionQueryAll) => {
      const payload = it.payload;
      const req: api.ReqPadsQueryAll = {
        query: {
          pageIndex: payload.pageIndex,
          pageSize: payload.pageSize,
          filters: payload.filters,
        }
      };
      return this.graphqlService.padsQueryAll(req)
        .map(resp => {
          const data = resp.data;
          const padList = resp.data.pads.map(one => new Pad(one));
          return new pads.PadsActionQueryAllSuccess({
            pads: data.pads.map(one => new Pad(one)),
            pageIndex: data.pageIndex,
            pageSize: data.pageSize,
            total: data.total,
          });
        })
        .catch((resp: HttpErrorResponse) => {
          const data = resp.error;
          return of(new pads.PadsActionQueryAllFailure(data));
        });
    })
  );

  @Effect()
  filterChange$ = this.actions$.pipe(
    ofType(pads.PadsActionTypes.FilterChange),
    withLatestFrom(this.store$.select(selectDashboardPadsState)),
    switchMap(([it, state]) => {
      const payload = (it as pads.PadsActionFilterChange).payload;
      const req: api.ReqPadsQueryAll = {
        query: {
          pageIndex: 0, // filter changed, should reset page index
          pageSize: state.pageSize,
          filters: payload,
        }
      };
      return this.doQueryAll(req);
    })
  );

  @Effect()
  pageChange$ = this.actions$.pipe(
    ofType(pads.PadsActionTypes.PageChange),
    withLatestFrom(this.store$.select(selectDashboardPadsState)),
    switchMap(([it, state]) => {
      const payload = (it as pads.PadsActionPageChange).payload;
      const req: api.ReqPadsQueryAll = {
        query: {
          pageIndex: payload.pageIndex,
          pageSize: payload.pageSize,
          filters: state.filters,
        }
      };
      return this.doQueryAll(req);
    })
  );

  private doQueryAll(req: api.ReqPadsQueryAll): Observable<pads.PadsAction> {
    return this.graphqlService.padsQueryAll(req).map(resp => {
      const data = resp.data;
      const padList = resp.data.pads.map(one => new Pad(one));
      return new pads.PadsActionQueryAllSuccess({
        pads: data.pads.map(one => new Pad(one)),
        pageIndex: data.pageIndex,
        pageSize: data.pageSize,
        total: data.total,
      });
    }).catch((resp: HttpErrorResponse) => {
      const data = resp.error;
      return of(new pads.PadsActionQueryAllFailure(data));
    });
  }
}
