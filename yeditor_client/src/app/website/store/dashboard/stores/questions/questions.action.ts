import { Action } from '@ngrx/store';
import { ApiErrorStateParams } from 'app/website/store/common/store/common.model';
import { Question } from './questions.model';


export const enum QuestionsActionTypes {
  QueryAll = '@website/dashboard/questions/query-all',
  QueryAllSuccess = '@website/dashboard/questions/query-all-success',
  QueryAllFailure = '@website/dashboard/questions/query-all-failure',
  UpdateFavorite = '@website/dashboard/questions/update-favorite',
  UpdateFavoriteSuccess = '@website/dashboard/questions/update-favorite-success',
  UpdateFavoriteFailure = '@website/dashboard/questions/update-favorite-failure',
  Save = '@website/dashboard/questions/save',
  SaveSuccess = '@website/dashboard/questions/save-success',
  SaveFailure = '@website/dashboard/questions/save-failure',
  Delete = '@website/dashboard/questions/delete',
  DeleteSuccess = '@website/dashboard/questions/delete-success',
  DeleteFailure = '@website/dashboard/questions/delete-failure',
  Selected = '@website/dashboard/questions/selected',
  // edit question
  QueryEditing = '@website/dashboad/questions/query-editing',
  QueryEditingSuccess = '@website/dashboard/questions/query-editing-success',
  QueryEditingFailure = '@website/dashboard/questions/query-editing-failure',
  QueryEditingClear = '@website/dashboard/questions/query-editing-clear',
}

export class QuestionsActionQueryAll implements Action {
  readonly type = QuestionsActionTypes.QueryAll;
}

export class QuestionsActionQueryAllSuccess implements Action {
  readonly type = QuestionsActionTypes.QueryAllSuccess;
  constructor(public readonly payload: {
    questions: Question[],
  }) { }
}

export class QuestionsActionQueryAllFailure implements Action {
  readonly type = QuestionsActionTypes.QueryAllFailure;
  constructor(public readonly payload: ApiErrorStateParams) { }
}

export class QuestionsActionUpdateFavorite implements Action {
  readonly type = QuestionsActionTypes.UpdateFavorite;
  constructor(public readonly payload: {
    question: Question, favorite: boolean
  }) { }
}

export class QuestionsActionUpdateFavoriteSuccess implements Action {
  readonly type = QuestionsActionTypes.UpdateFavoriteSuccess;
  constructor(public readonly payload: {
    questionId: number, favorite: boolean
  }) { }
}

export class QuestionsActionUpdateFavoriteFailure implements Action {
  readonly type = QuestionsActionTypes.UpdateFavoriteFailure;
  constructor(public readonly payload: ApiErrorStateParams) { }
}

export class QuestionsActionSave implements Action {
  readonly type = QuestionsActionTypes.Save;
  constructor(public readonly payload: {
    question: Question,
  }) { }
}

export class QuestionsActionSaveSuccess implements Action {
  readonly type = QuestionsActionTypes.SaveSuccess;
  constructor(public readonly payload: {
    question: Question
  }) { }
}

export class QuestionsActionSaveFailure implements Action {
  readonly type = QuestionsActionTypes.SaveFailure;
  constructor(public readonly payload: ApiErrorStateParams) { }
}

export class QuestionsActionDelete implements Action {
  readonly type = QuestionsActionTypes.Delete;
  constructor(public readonly payload: {
    question: Question,
  }) { }
}

export class QuestionsActionDeleteSuccess implements Action {
  readonly type = QuestionsActionTypes.DeleteSuccess;
  constructor(public readonly payload: {
    questionId: number
  }) { }
}

export class QuestionsActionDeleteFailure implements Action {
  readonly type = QuestionsActionTypes.DeleteFailure;
  constructor(public readonly payload: ApiErrorStateParams) { }
}

export class QuestionsActionSelected implements Action {
  readonly type = QuestionsActionTypes.Selected;
  constructor(public readonly payload: { selectedQuestionId: number }) { }
}

// QueryEditing
export class QuestionsActionQueryEditing implements Action {
  readonly type = QuestionsActionTypes.QueryEditing;
  constructor(public readonly payload: { questionId: number }) { }
}
export class QuestionsActionQueryEditingSuccess implements Action {
  readonly type = QuestionsActionTypes.QueryEditingSuccess;
  constructor(public readonly payload: { question: Question }) { }
}
export class QuestionsActionQueryEditingFailure implements Action {
  readonly type = QuestionsActionTypes.QueryEditingFailure;
  constructor(public readonly payload: ApiErrorStateParams) { }
}
export class QuestionsActionQueryEditingClear implements Action {
  readonly type = QuestionsActionTypes.QueryEditingClear;
}

export type QuestionsAction =
  | QuestionsActionQueryAll
  | QuestionsActionQueryAllSuccess
  | QuestionsActionQueryAllFailure
  | QuestionsActionUpdateFavorite
  | QuestionsActionUpdateFavoriteSuccess
  | QuestionsActionUpdateFavoriteFailure
  | QuestionsActionSave
  | QuestionsActionSaveSuccess
  | QuestionsActionSaveFailure
  | QuestionsActionDelete
  | QuestionsActionDeleteSuccess
  | QuestionsActionDeleteFailure
  | QuestionsActionSelected
  | QuestionsActionQueryEditing
  | QuestionsActionQueryEditingSuccess
  | QuestionsActionQueryEditingFailure
  | QuestionsActionQueryEditingClear
  ;
