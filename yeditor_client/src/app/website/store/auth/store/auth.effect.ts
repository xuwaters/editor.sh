import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import * as api from 'app/website/shared/models/api.model';
import { ApiService } from 'app/website/shared/services/api/api.service';
import { GraphQLService } from 'app/website/shared/services/api/graphql.service';
import { JwtService } from 'app/website/shared/services/api/jwt.service';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { defer } from 'rxjs/observable/defer';
import { of } from 'rxjs/observable/of';
import { switchMap, tap } from 'rxjs/operators';
import { ApiErrorStateParams } from '../../common/store/common.model';
import { WebsiteState } from '../../website-store.reducer';
import * as auth from './auth.action';
import { SessionParams } from './auth.model';


@Injectable()
export class AuthEffect {

  constructor(
    private router: Router,
    private actions$: Actions,
    private store$: Store<WebsiteState>,
    private jwtService: JwtService,
    private apiService: ApiService,
    private logger: LoggerService,
    private graphqlService: GraphQLService,
  ) { }

  @Effect({ dispatch: false })
  initAction$: Observable<Action> = defer(() => {
    // this.logger.log('>> init authEffect');
    const token = this.jwtService.getToken();
    if (token != null && token.length > 0) {
      const session: SessionParams = {
        token: token
      };
      this.store$.dispatch(new auth.AuthActionLoadTokenSuccess({ session: session }));
    }
  });

  @Effect()
  refreshToken$: Observable<Action> = this.actions$.pipe(
    ofType(auth.AuthActionTypes.RefreshToken),
    switchMap((it: auth.AuthActionRefreshToken) => {
      // check local token
      const token = this.jwtService.getToken();
      if (token == null || token.length === 0) {
        return of(new auth.AuthActionRefreshTokenFailure({ errors: null }));
      }

      return this.graphqlService.userSessionRefresh().map(resp => {
        const data = resp.data;
        return new auth.AuthActionRefreshTokenSuccess({
          user: data.user,
          session: data.session,
        });
      }).catch((resp: HttpErrorResponse) => {
        const data = resp.error;
        return of(new auth.AuthActionRefreshTokenFailure({ ...data }));
      });
    })
  );

  @Effect({ dispatch: false })
  refreshTokenSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(auth.AuthActionTypes.RefreshTokenSuccess),
    tap((it: auth.AuthActionRefreshTokenSuccess) => {
      this.jwtService.saveToken(it.payload.session.token);
    })
  );

  @Effect({ dispatch: false })
  refreshTokenFailure$: Observable<Action> = this.actions$.pipe(
    ofType(auth.AuthActionTypes.RefreshTokenFailure),
    tap((it: auth.AuthActionRefreshTokenFailure) => {
      this.jwtService.destroyToken();
    })
  );

  @Effect()
  login$: Observable<Action> = this.actions$.pipe(
    ofType(auth.AuthActionTypes.Login),
    switchMap((it: auth.AuthActionLogin) => {
      const authentication = it.payload;
      const req = <api.ReqUserLogin>{
        user: {
          email: authentication.email,
          password: authentication.password,
        }
      };
      return this.graphqlService.userLogin(req).map(resp => {
        const data = resp.data;
        return new auth.AuthActionLoginSuccess({
          user: data.user,
          session: data.session
        });
      }).catch((err: ApiErrorStateParams) => {
        return of(new auth.AuthActionLoginFailure(err));
      });
    })
  );

  @Effect({ dispatch: false })
  loginSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(auth.AuthActionTypes.LoginSuccess),
    tap((it: auth.AuthActionLoginSuccess) => {
      this.jwtService.saveToken(it.payload.session.token);
      this.router.navigate(['/dashboard']);
    })
  );

  @Effect({ dispatch: false })
  loginRedirect$: Observable<Action> = this.actions$.pipe(
    ofType(auth.AuthActionTypes.LoginRedirect),
    tap((it: auth.AuthActionLoginRedirect) =>
      this.router.navigate(['/account/login'])
    )
  );

  @Effect()
  logout$: Observable<Action> = this.actions$.pipe(
    ofType(auth.AuthActionTypes.Logout),
    switchMap((it: auth.AuthActionLogout) =>
      this.graphqlService.userLogout()
        .map(resp => new auth.AuthActionLogoutSuccess())
        .catch(err => of(new auth.AuthActionLogoutSuccess()))
    )
  );

  @Effect({ dispatch: false })
  logoutSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(auth.AuthActionTypes.LogoutSuccess),
    tap((it: auth.AuthActionLogoutSuccess) => {
      this.jwtService.destroyToken();
      this.router.navigate(['/']);
    })
  );


  @Effect()
  register$: Observable<Action> = this.actions$.pipe(
    ofType(auth.AuthActionTypes.Register),
    switchMap((it: auth.AuthActionRegister) => {
      const registration = it.payload;
      const req = <api.ReqUserRegister>{
        user: {
          email: registration.email,
          name: registration.name,
          password: registration.password,
        },
        options: registration.options,
      };
      return this.graphqlService.userRegister(req).map(resp => {
        const data = resp.data;
        return new auth.AuthActionRegisterSuccess({
          user: data.user,
          session: data.session,
        });
      }).catch((err: ApiErrorStateParams) => {
        return of(new auth.AuthActionRegisterFailure(err));
      });
    })
  );

  @Effect({ dispatch: false })
  registerSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(auth.AuthActionTypes.RegisterSuccess),
    tap((it: auth.AuthActionRegisterSuccess) => {
      this.jwtService.saveToken(it.payload.session.token);
      this.router.navigate(['/dashboard']);
    })
  );

  @Effect()
  oauthQueryUrl$: Observable<Action> = this.actions$.pipe(
    ofType(auth.AuthActionTypes.OAuthQueryUrl),
    switchMap((it: auth.AuthActionOAuthQueryUrl) => {
      let oauthQueryUrlParams = it.payload;
      let req = <api.ReqOAuthQueryUrl>{
        platform: oauthQueryUrlParams.platform,
      };
      return this.graphqlService.userOAuthQueryUrl(req).map(resp => {
        const data = resp.data;
        return new auth.AuthActionOAuthQueryUrlSuccess({
          platform: data.platform,
          authorize_url: data.authorizeUrl,
        });
      }).catch((err: ApiErrorStateParams) => {
        return of(new auth.AuthActionOAuthLoginFailure(err));
      });
    })
  );

  @Effect({ dispatch: false })
  oauthQueryUrlSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(auth.AuthActionTypes.OAuthQueryUrlSuccess),
    tap((it: auth.AuthActionOAuthQueryUrlSuccess) => {
      let params = it.payload;
      window.location.href = params.authorize_url;
    })
  );

  @Effect()
  oauthLogin$: Observable<Action> = this.actions$.pipe(
    ofType(auth.AuthActionTypes.OAuthLogin),
    switchMap((it: auth.AuthActionOAuthLogin) => {
      const oauthLoginParams = it.payload;
      const req = <api.ReqOAuthLogin>{
        platform: oauthLoginParams.platform,
        code: oauthLoginParams.code,
      };
      return this.graphqlService.userOAuthLogin(req).map(resp => {
        const data = resp.data;
        return new auth.AuthActionOAuthLoginSuccess({
          user: data.user,
          session: data.session,
        });
      }).catch((err: ApiErrorStateParams) => {
        return of(new auth.AuthActionOAuthLoginFailure(err));
      });
    })
  );

  @Effect({ dispatch: false })
  oauthLoginSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(auth.AuthActionTypes.OAuthLoginSuccess),
    tap((it: auth.AuthActionOAuthLoginSuccess) => {
      // save login data
      this.jwtService.saveToken(it.payload.session.token);
      // redirect to dashboard
      this.router.navigate(['/dashboard']);
    })
  );
}
