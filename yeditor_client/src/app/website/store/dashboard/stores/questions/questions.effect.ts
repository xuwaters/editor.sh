import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import * as api from 'app/website/shared/models/api.model';
import { Languages } from 'app/website/shared/models/languages.model';
import { ApiService } from 'app/website/shared/services/api/api.service';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import * as common from 'app/website/store/common/store/common.action';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map, switchMap, tap } from 'rxjs/operators';
import * as actions from './questions.action';
import { Question, QuestionParams } from './questions.model';

@Injectable()
export class QuestionsEffect {

  constructor(
    private actions$: Actions,
    private apiService: ApiService,
    private router: Router,
    private logger: LoggerService,
    private location: Location,
  ) { }


  @Effect()
  queryAll$: Observable<Action> = this.actions$.pipe(
    ofType(actions.QuestionsActionTypes.QueryAll),
    switchMap((action: actions.QuestionsActionQueryAll) => {
      const req: api.ReqQuestionsQueryAll = {
        query: {
          offset: 0,
          limit: 9999,
          search: '',
        }
      };
      return this.apiService.questionsQueryAll(req)
        .map(resp => {
          const data = resp.data;
          const questions: Question[] = data.questions.map(item => new Question(<QuestionParams>{
            ...item,
            language: Languages.getLanguageById(item.language),
            createTime: new Date(item.createTime),
          }));
          return new actions.QuestionsActionQueryAllSuccess({ questions: questions });
        })
        .catch((resp: HttpErrorResponse) => {
          const data = resp.error;
          return of(new actions.QuestionsActionQueryAllFailure(data));
        });
    })
  );

  @Effect({ dispatch: false })
  selectQuestion$: Observable<Action> = this.actions$.pipe(
    ofType(actions.QuestionsActionTypes.Selected),
    tap((action: actions.QuestionsActionSelected) => {
      const questionId = action.payload.selectedQuestionId;
      if (questionId > 0) {
        this.location.go(`/dashboard/questions/${questionId}`);
      } else {
        this.location.go('/dashboard/questions');
      }
    })
  );


  @Effect()
  updateFavorite$: Observable<Action> = this.actions$.pipe(
    ofType(actions.QuestionsActionTypes.UpdateFavorite),
    switchMap((action: actions.QuestionsActionUpdateFavorite) => {
      const req = <api.ReqQuestionUpdateFavorite>{
        question: {
          id: action.payload.question.id,
          favorite: action.payload.favorite,
        }
      };
      return this.apiService.questionUpdateFavorite(req)
        .map(resp => {
          const question = resp.data.question;
          return new actions.QuestionsActionUpdateFavoriteSuccess({
            questionId: question.id,
            favorite: question.favorite,
          });
        })
        .catch((resp: HttpErrorResponse) => {
          const data = resp.error;
          return of(new actions.QuestionsActionUpdateFavoriteFailure(data));
        });
    })
  );


  @Effect()
  save$: Observable<Action> = this.actions$.pipe(
    ofType(actions.QuestionsActionTypes.Save),
    switchMap((action: actions.QuestionsActionSave) => {
      const question = action.payload.question;
      const questionObject = question.toObject();
      const req = <api.ReqQuestionSave>{
        question: {
          ...questionObject,
          createTime: question.createTime.toUTCString(),
          language: question.language && question.language.id || '',
        }
      };
      return this.apiService.questionSave(req)
        .map(resp => {
          const data = resp.data.question;
          const respQuestion = <QuestionParams>{
            ...data,
            language: Languages.getLanguageById(data.language),
            createTime: new Date(data.createTime),
          };
          // this.logger.log('language = ', data.language, ' obj = ', respQuestion.language);
          return new actions.QuestionsActionSaveSuccess({ question: new Question(respQuestion) });
        })
        .catch((resp: HttpErrorResponse) => {
          const data = resp.error;
          return of(new actions.QuestionsActionSaveFailure(data));
        });
    })
  );

  @Effect()
  saveSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actions.QuestionsActionTypes.SaveSuccess),
    map((action: actions.QuestionsActionSaveSuccess) => {
      this.router.navigate(['/dashboard/questions', action.payload.question.id]);
      return new common.CommonActionSnackBarMessage({ message: 'Question Saved' });
    })
  );

  @Effect()
  delete$: Observable<Action> = this.actions$.pipe(
    ofType(actions.QuestionsActionTypes.Delete),
    switchMap((action: actions.QuestionsActionDelete) => {
      const question = action.payload.question;
      const req = <api.ReqQuestionDelete>{
        question: {
          id: question.id
        }
      };
      return this.apiService.questionDelete(req)
        .map(resp => {
          const data = resp.data;
          return new actions.QuestionsActionDeleteSuccess({ questionId: data.questionId });
        })
        .catch((resp: HttpErrorResponse) => {
          const data = resp.error;
          return of(new actions.QuestionsActionDeleteFailure(data));
        });
    })
  );

  @Effect()
  deleteSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actions.QuestionsActionTypes.DeleteSuccess),
    map((action: actions.QuestionsActionDeleteSuccess) => {
      this.router.navigate(['/dashboard/questions']);
      return new common.CommonActionSnackBarMessage({ message: 'Question Deleted' });
    })
  );

  @Effect()
  queryEditing$: Observable<Action> = this.actions$.pipe(
    ofType(actions.QuestionsActionTypes.QueryEditing),
    switchMap((action: actions.QuestionsActionQueryEditing) => {
      const req: api.ReqQuestionQueryOne = {
        question: { id: action.payload.questionId }
      };
      return this.apiService.questionQueryOne(req)
        .map(resp => {
          const data = resp.data;
          const question = data.question;
          return new actions.QuestionsActionQueryEditingSuccess({
            question: new Question({
              ...question,
              language: Languages.getLanguageById(question.language),
              createTime: new Date(question.createTime),
            })
          });
        })
        .catch((resp: HttpErrorResponse) => {
          const data = resp.error;
          return of(new actions.QuestionsActionQueryEditingFailure(data));
        });
    })
  );
}
