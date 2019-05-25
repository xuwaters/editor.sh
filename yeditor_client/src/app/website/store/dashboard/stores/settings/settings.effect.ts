import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import * as api from 'app/website/shared/models/api.model';
import { Languages } from 'app/website/shared/models/languages.model';
import { ApiService } from 'app/website/shared/services/api/api.service';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import * as common from 'app/website/store/common/store/common.action';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { switchMap } from 'rxjs/operators';
import * as actions from './settings.action';
import { Setting } from './settings.model';

@Injectable()
export class SettingsEffect {

  constructor(
    private actions$: Actions,
    private apiService: ApiService,
    private router: Router,
    private logger: LoggerService,
    private store$: Store<WebsiteState>,
  ) {
  }

  @Effect()
  query$: Observable<Action> = this.actions$.pipe(
    ofType(actions.SettingsActionTypes.Query),
    switchMap((it) => {
      return this.apiService.settingQuery().map(resp => {
        const data = resp.data;
        const setting = new Setting({
          ...data.setting,
          language: Languages.getLanguageById(data.setting.language),
        });
        return new actions.SettingsActionQuerySuccess({ setting: setting });
      }).catch((resp: HttpErrorResponse) => {
        const data = resp.error;
        return of(new actions.SettingsActionQueryFailure(data));
      });
    })
  );

  @Effect()
  save$: Observable<Action> = this.actions$.pipe(
    ofType(actions.SettingsActionTypes.Save),
    switchMap(it => {
      const msg = it as actions.SettingsActionSave;
      const req: api.ReqSettingSave = {
        setting: {
          ...msg.payload.setting,
          language: msg.payload.setting.language.id,
        },
      };
      return this.apiService.settingSave(req).map(resp => {
        const data = resp.data;
        const setting = new Setting({
          ...data.setting,
          language: Languages.getLanguageById(data.setting.language),
        });
        this.store$.dispatch(new common.CommonActionSnackBarMessage({ message: 'Save Success!' }));
        return new actions.SettingsActionSaveSuccess({ setting: setting });
      }).catch((resp: HttpErrorResponse) => {
        const data = resp.error;
        return of(new actions.SettingsActionSaveFailure(data));
      });
    })
  );

  @Effect()
  refershApiKey$: Observable<Action> = this.actions$.pipe(
    ofType(actions.SettingsActionTypes.RefreshApiKey),
    switchMap(it => {
      const msg = it as actions.SettingsActionRefreshApiKey;
      return this.apiService.settingRefreshApiKey().map(resp => {
        const data = resp.data;
        return new actions.SettingsActionRefreshApiKeySuccess({ api_key: data.api_key });
      }).catch(resp => {
        const data = resp.error;
        return of(new actions.SettingsActionRefreshApiKeyFailure(data));
      });
    })
  );
}
