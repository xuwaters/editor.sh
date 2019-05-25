import { Action } from '@ngrx/store';
import { ApiErrorStateParams } from 'app/website/store/common/store/common.model';
import { Database } from './databases.model';


export const enum DatabasesActionTypes {
  QueryAll = '@website/dashboard/databases/query-all',
  QueryAllSuccess = '@website/dashboard/databases/query-all-success',
  QueryAllFailure = '@website/dashboard/databases/query-all-failure',
  Save = '@website/dashboard/databases/save',
  SaveSuccess = '@website/dashboard/databases/save-success',
  SaveFailure = '@website/dashboard/databases/save-failure',
  Delete = '@website/dashboard/databases/delete',
  DeleteSuccess = '@website/dashboard/databases/delete-success',
  DeleteFailure = '@website/dashboard/databases/delete-failure',
}

export class DatabasesActionQueryAll implements Action {
  readonly type = DatabasesActionTypes.QueryAll;
}

export class DatabasesActionQueryAllSuccess implements Action {
  readonly type = DatabasesActionTypes.QueryAllSuccess;
  constructor(public readonly payload: {
    databases: Database[],
  }) { }
}

export class DatabasesActionQueryAllFailure implements Action {
  readonly type = DatabasesActionTypes.QueryAllFailure;
  constructor(public readonly payload: ApiErrorStateParams) { }
}

export class DatabasesActionSave implements Action {
  readonly type = DatabasesActionTypes.Save;
  constructor(public readonly payload: {
    database: Database,
  }) { }
}

export class DatabasesActionSaveSuccess implements Action {
  readonly type = DatabasesActionTypes.SaveSuccess;
  constructor(public readonly payload: {
    database: Database
  }) { }
}

export class DatabasesActionSaveFailure implements Action {
  readonly type = DatabasesActionTypes.SaveFailure;
  constructor(public readonly payload: ApiErrorStateParams) { }
}

export class DatabasesActionDelete implements Action {
  readonly type = DatabasesActionTypes.Delete;
  constructor(public readonly payload: {
    database: Database,
  }) { }
}

export class DatabasesActionDeleteSuccess implements Action {
  readonly type = DatabasesActionTypes.DeleteSuccess;
  constructor(public readonly payload: {
    databaseId: number,
  }) { }
}

export class DatabasesActionDeleteFailure implements Action {
  readonly type = DatabasesActionTypes.DeleteFailure;
  constructor(public readonly payload: ApiErrorStateParams) { }
}

export type DatabasesAction =
  | DatabasesActionQueryAll
  | DatabasesActionQueryAllSuccess
  | DatabasesActionQueryAllFailure
  | DatabasesActionSave
  | DatabasesActionSaveSuccess
  | DatabasesActionSaveFailure
  | DatabasesActionDelete
  | DatabasesActionDeleteSuccess
  | DatabasesActionDeleteFailure
  ;
