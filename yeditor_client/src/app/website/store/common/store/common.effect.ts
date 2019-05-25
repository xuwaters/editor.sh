import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { JwtService } from 'app/website/shared/services/api/jwt.service';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { Observable } from 'rxjs/Observable';
import { map, tap } from 'rxjs/operators';
import { AuthActionLoginRedirect } from '../../auth/store/auth.action';
import { WebsiteState } from '../../website-store.reducer';
import { CommonActionApiErrorState, CommonActionSnackBarMessage, CommonActionTypes } from './common.action';

@Injectable()
export class CommonEffect {

  constructor(
    private actions$: Actions,
    private store$: Store<WebsiteState>,
    private router: Router,
    private jwtService: JwtService,
    private logger: LoggerService,
  ) { }

  @Effect()
  apiError$: Observable<Action> = this.actions$.pipe(
    ofType(CommonActionTypes.ApiErrorState),
    map((it: CommonActionApiErrorState) => {
      const message = this.makeErrorMessage(it.payload);
      return new CommonActionSnackBarMessage({ message: message });
    })
  );

  @Effect({ dispatch: false })
  apiUnauthorizedAccess$: Observable<Action> = this.actions$.pipe(
    ofType(CommonActionTypes.ApiUnauthorizedAccess),
    tap(it => {
      this.jwtService.destroyToken();
      this.store$.dispatch(new AuthActionLoginRedirect());
    })
  );

  makeErrorMessage(payload): string {
    // TODO: load human readable message from errors.detail
    const detail = payload.errors['detail'] || '';
    if (detail === '') {
      return '';
    } else {
      return detail;
    }
  }

}

