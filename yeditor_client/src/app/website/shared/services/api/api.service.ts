import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommonActionApiErrorState, CommonActionApiUnauthorizedAccess } from 'app/website/store/common';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import { throwError } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import * as api from '../../models/api.model';
import { CommonService } from '../common/common.service';
import { LoggerService } from '../common/logger.service';
import { JwtService } from './jwt.service';


export interface ApiConfig {
  apiKey: string;
  apiUrl: string;
  socketUrl: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('api.config');

@Injectable()
export class ApiService {

  constructor(
    // params used to initialize api service
    @Inject(API_CONFIG) private apiConfig: ApiConfig,
    private http: HttpClient,
    private logger: LoggerService,
    private jwtService: JwtService,
    private common: CommonService,
    private store$: Store<WebsiteState>,
  ) { }

  get config(): ApiConfig { return this.apiConfig; }

  private getApiUrl(action: string): string {
    return this.apiConfig.apiUrl.replace(/\{action\}/g, action);
  }

  private getHttpHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    // update token
    const token = this.jwtService.getToken();
    if (token && token.length > 0) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    // this.logger.log('http headers = ', headers);
    return headers;
  }

  private handleUnauthorizedError<T>(resp: HttpErrorResponse): Observable<T> {
    if (resp.status === 401) {
      this.store$.dispatch(new CommonActionApiUnauthorizedAccess());
    }
    if (!resp.ok) {
      let params = resp.error;
      if (typeof(params) === 'string') {
        resp = new HttpErrorResponse({
          error: { errors: { msg: params } },
          headers: resp.headers,
          status: resp.status,
          statusText: resp.statusText,
          url: resp.url,
        });
      }
      this.store$.dispatch(new CommonActionApiErrorState(resp.error));
    }
    this.logger.log('caught response = ', resp);
    return throwError(resp);
  }

  private get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(url, {
      headers: this.getHttpHeaders(),
      observe: 'body',
      responseType: 'json',
      params: params,
    }).catch((resp: HttpErrorResponse) => this.handleUnauthorizedError<T>(resp));
  }

  private delete<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.delete<T>(url, {
      headers: this.getHttpHeaders(),
      observe: 'body',
      responseType: 'json',
      params: params,
    }).catch((resp: HttpErrorResponse) => this.handleUnauthorizedError<T>(resp));
  }

  private post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body, {
      headers: this.getHttpHeaders(),
      observe: 'body',
      responseType: 'json',
    }).catch((resp: HttpErrorResponse) => this.handleUnauthorizedError<T>(resp));
  }

  private put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body, {
      headers: this.getHttpHeaders(),
      observe: 'body',
      responseType: 'json',
    }).catch((resp: HttpErrorResponse) => this.handleUnauthorizedError<T>(resp));
  }

  // service api

  userRegister(req: api.ReqUserRegister): Observable<api.RespUserRegister> {
    const url = this.getApiUrl('users');
    return this.post<api.RespUserRegister>(url, req);
  }

  userSessionRefresh(req: api.ReqUserSessionRefresh): Observable<api.RespUserSessionRefresh> {
    const url = this.getApiUrl('sessions/refresh');
    return this.post<api.RespUserSessionRefresh>(url, req);
  }

  userLogin(req: api.ReqUserLogin): Observable<api.RespUserLogin> {
    const url = this.getApiUrl('sessions');
    return this.post<api.RespUserLogin>(url, req);
  }

  userLogout(): Observable<api.RespUserLogout> {
    const url = this.getApiUrl('sessions');
    return this.delete<api.RespUserLogout>(url);
  }

  padsQueryAll(req: api.ReqPadsQueryAll): Observable<api.RespPadsQueryAll> {
    const url = this.getApiUrl('dashboard/pads');
    const params = this.common.toHttpParams(req);
    return this.get<api.RespPadsQueryAll>(url, params);
  }

  padsCreate(req: api.ReqPadsCreate): Observable<api.RespPadsCreate> {
    const url = this.getApiUrl('dashboard/pads');
    return this.post<api.RespPadsCreate>(url, req);
  }

  questionsQueryAll(req: api.ReqQuestionsQueryAll): Observable<api.RespQuestionsQueryAll> {
    const url = this.getApiUrl('dashboard/questions');
    const params = this.common.toHttpParams(req);
    return this.get<api.RespQuestionsQueryAll>(url, params);
  }

  questionUpdateFavorite(req: api.ReqQuestionUpdateFavorite): Observable<api.RespQuestionUpdateFavorite> {
    const url = this.getApiUrl(`dashboard/questions/${req.question.id}/favorite`);
    return this.post<api.RespQuestionUpdateFavorite>(url, req);
  }

  questionSave(req: api.ReqQuestionSave): Observable<api.RespQuestionSave> {
    if (req.question.id != null && req.question.id > 0) {
      const url = this.getApiUrl(`dashboard/questions/${req.question.id}`);
      return this.put<api.RespQuestionSave>(url, req);
    } else {
      const url = this.getApiUrl('dashboard/questions');
      return this.post<api.RespQuestionSave>(url, req);
    }
  }

  questionDelete(req: api.ReqQuestionDelete): Observable<api.RespQuestionDelete> {
    const url = this.getApiUrl(`dashboard/questions/${req.question.id}`);
    return this.delete<api.RespQuestionDelete>(url);
  }

  questionQueryOne(req: api.ReqQuestionQueryOne): Observable<api.RespQuestionQueryOne> {
    const url = this.getApiUrl(`dashboard/questions/${req.question.id}`);
    return this.get<api.RespQuestionQueryOne>(url);
  }

  databasesQueryAll(): Observable<api.RespDatabasesQueryAll> {
    const url = this.getApiUrl('dashboard/databases');
    return this.get<api.RespDatabasesQueryAll>(url);
  }

  databaseSave(req: api.ReqDatabaseSave): Observable<api.RespDatabaseSave> {
    if (req.database.id != null && req.database.id > 0) {
      const url = this.getApiUrl(`dashboard/databases/${req.database.id}`);
      return this.put<api.RespDatabaseSave>(url, req);
    } else {
      const url = this.getApiUrl('dashboard/databases');
      return this.post<api.RespDatabaseSave>(url, req);
    }
  }

  databaseDelete(req: api.ReqDatabaseDelete): Observable<api.RespDatabaseDelete> {
    const url = this.getApiUrl(`dashboard/databases/${req.database.id}`);
    return this.delete<api.RespDatabaseDelete>(url);
  }

  settingQuery(): Observable<api.RespSettingQuery> {
    const url = this.getApiUrl('dashboard/settings');
    return this.get<api.RespSettingQuery>(url);
  }

  settingSave(req: api.ReqSettingSave): Observable<api.RespSettingSave> {
    const url = this.getApiUrl(`dashboard/settings/${req.setting.id}`);
    return this.put<api.RespSettingSave>(url, req);
  }

  settingRefreshApiKey(): Observable<api.RespSettingRefreshApiKey> {
    const url = this.getApiUrl('dashboard/settings/refresh_api_key');
    return this.post<api.RespSettingRefreshApiKey>(url, {});
  }

}
