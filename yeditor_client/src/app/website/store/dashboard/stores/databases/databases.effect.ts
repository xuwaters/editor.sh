import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import * as api from 'app/website/shared/models/api.model';
import { DatabaseEngines } from 'app/website/shared/models/database-engines.model';
import { ApiService } from 'app/website/shared/services/api/api.service';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import * as common from 'app/website/store/common/store/common.action';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map, switchMap } from 'rxjs/operators';
import * as actions from './databases.action';
import { Database, DatabaseParams, DatabaseStatus } from './databases.model';


@Injectable()
export class DatabasesEffect {

  constructor(
    private actions$: Actions,
    private apiService: ApiService,
    private router: Router,
    private logger: LoggerService,
  ) { }

  @Effect()
  queryAll$: Observable<Action> = this.actions$.pipe(
    ofType(actions.DatabasesActionTypes.QueryAll),
    switchMap((action: actions.DatabasesActionQueryAll) => {
      return this.apiService.databasesQueryAll()
        .map(resp => {
          const data = resp.data;
          const databases: Database[] = data.databases.map(item => new Database(<DatabaseParams>{
            ...item,
            status: <DatabaseStatus>(item.status),
            engine: DatabaseEngines.getDatabaseEngineById(item.engine),
          }));
          return new actions.DatabasesActionQueryAllSuccess({ databases: databases });
        })
        .catch((resp: HttpErrorResponse) => {
          if (!(resp instanceof HttpErrorResponse)) {
            this.logger.log('database.queryAll error response: ', resp);
          }
          const data = resp.error;
          return of(new actions.DatabasesActionQueryAllFailure(data));
        });
    })
  );

  @Effect()
  save$: Observable<Action> = this.actions$.pipe(
    ofType(actions.DatabasesActionTypes.Save),
    switchMap((action: actions.DatabasesActionSave) => {
      const database = action.payload.database;
      const databaseObject = database.toObject();
      const req = <api.ReqDatabaseSave>{
        database: {
          ...databaseObject,
          status: database.status as number,
          engine: database.engine.id,
        }
      };
      return this.apiService.databaseSave(req)
        .map(resp => {
          const data = resp.data.database;
          const respDatabase = <DatabaseParams>{
            ...data,
            status: data.status as DatabaseStatus,
            engine: DatabaseEngines.getDatabaseEngineById(data.engine),
          };
          // this.logger.log('language = ', data.language, ' obj = ', respDatabase.language);
          return new actions.DatabasesActionSaveSuccess({ database: new Database(respDatabase) });
        })
        .catch((resp: HttpErrorResponse) => {
          const data = resp.error;
          if (!data) {
            this.logger.log('database.queryAll error: ', resp);
          }
          return of(new actions.DatabasesActionSaveFailure(data));
        });
    })
  );

  @Effect()
  saveSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actions.DatabasesActionTypes.SaveSuccess),
    map((action: actions.DatabasesActionSaveSuccess) => {
      this.router.navigate(['/dashboard/databases/show', action.payload.database.id]);
      return new common.CommonActionSnackBarMessage({ message: 'Database Saved' });
    })
  );


  @Effect()
  delete$: Observable<Action> = this.actions$.pipe(
    ofType(actions.DatabasesActionTypes.Delete),
    switchMap((action: actions.DatabasesActionDelete) => {
      const database = action.payload.database;
      const req = <api.ReqDatabaseDelete>{
        database: {
          id: database.id
        }
      };
      return this.apiService.databaseDelete(req)
        .map(resp => {
          const data = resp.data;
          return new actions.DatabasesActionDeleteSuccess({ databaseId: data.databaseId });
        })
        .catch((resp: HttpErrorResponse) => {
          const data = resp.error;
          return of(new actions.DatabasesActionDeleteFailure(data));
        });
    })
  );

  @Effect()
  deleteSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actions.DatabasesActionTypes.DeleteSuccess),
    map((action: actions.DatabasesActionDeleteSuccess) => {
      this.router.navigate(['/dashboard/databases']);
      return new common.CommonActionSnackBarMessage({ message: 'Database Deleted' });
    })
  );

}
