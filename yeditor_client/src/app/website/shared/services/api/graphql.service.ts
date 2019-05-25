import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClientOptions, ApolloError } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { ApiErrorStateParams } from 'app/website/store/common/store/common.model';
import gql from 'graphql-tag';
import { Observable, throwError } from 'rxjs';
import * as api from '../../models/api.model';
import { LoggerService } from '../common/logger.service';
import * as graph from './graphql.data';
import { JwtService } from './jwt.service';
import { HttpErrorResponse } from '@angular/common/http';


export function createApollo(httpLink: HttpLink): ApolloClientOptions<NormalizedCacheObject> {
  const uri = '/graphql';
  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem(JwtService.TOKEN_KEY);
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      }
    };
  });
  return <ApolloClientOptions<NormalizedCacheObject>>{
    link: authLink.concat(httpLink.create({ uri })),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      }
    }
  };
}

@Injectable()
export class GraphQLService {

  constructor(
    private apollo: Apollo,
    private logger: LoggerService,
  ) {

  }

  private translateErrorResponse<T>(err: any): Observable<T> {
    if (err instanceof ApolloError) {
      const data = <ApiErrorStateParams>{
        errors: err.graphQLErrors.map(item => ({
          message: item.message,
          extensions: item.extensions
        }))
      };
      return throwError(data);
    } else {
      this.logger.log(err);
      return throwError(err);
    }
  }

  // tslint:disable-next-line:member-ordering
  private static readonly mUserLogin = gql`
    mutation UserLogin($req: ApiReqUserLogin!) {
      user {
        login(req: $req) {
          session { token },
          user { id, email, name }
        }
      }
    }
  `;

  userLogin(req: api.ReqUserLogin): Observable<api.RespUserLogin> {
    let user = req.user;
    return this.apollo.mutate({
      mutation: GraphQLService.mUserLogin,
      variables: {
        req: {
          email: user.email,
          password: user.password,
        }
      }
    }).map(({ data }) => {
      let res = data.user.login;
      return <api.RespUserLogin>{
        data: {
          session: {
            token: res.session.token,
          },
          user: {
            id: res.user.id,
            email: res.user.email,
            name: res.user.name,
          }
        }
      };
    }).catch((err: ApolloError) => this.translateErrorResponse(err));
  }

  // tslint:disable-next-line:member-ordering
  private static readonly mUserOAuthQueryUrl = gql`
    query UserOAuthQueryUrl($req: ApiReqUserOAuthQueryUrl!) {
      user {
        oauthUrl(req: $req) {
          platform,
          authorizeUrl,
        }
      }
    }
  `;
  userOAuthQueryUrl(req: api.ReqOAuthQueryUrl): Observable<api.RespOAuthQueryUrl> {
    return this.apollo.query({
      query: GraphQLService.mUserOAuthQueryUrl,
      variables: {
        req: {
          platform: req.platform,
        }
      },
    }).map(({ data }) => {
      let response = (data as graph.UserOAuthQueryUrl);
      let res = response.user.oauthUrl;
      return <api.RespOAuthQueryUrl>{
        data: res
      };
    }).catch((err: ApolloError) => this.translateErrorResponse(err));
  }

  // tslint:disable-next-line:member-ordering
  private static readonly mUserOAuthLogin = gql`
    mutation UserOAuthLogin($req: ApiReqUserOAuthLogin!) {
      user {
        oauthLogin(req: $req) {
          session { token },
          user { id, email, name }
        }
      }
    }
  `;
  userOAuthLogin(req: api.ReqOAuthLogin): Observable<api.RespOAuthLogin> {
    return this.apollo.mutate({
      mutation: GraphQLService.mUserOAuthLogin,
      variables: {
        req: {
          platform: req.platform,
          code: req.code,
        }
      }
    }).map(({ data }) => {
      let response = data as graph.UserOAuthLogin;
      let res = response.user.oauthLogin;
      return <api.RespOAuthLogin>{
        data: {
          session: { token: res.session.token },
          user: { id: res.user.id, email: res.user.email, name: res.user.name }
        }
      };
    }).catch((err: ApolloError) => this.translateErrorResponse(err));
  }

  // tslint:disable-next-line:member-ordering
  private static readonly mUserRegister = gql`
    mutation UserRegister($req: ApiReqUserRegister!) {
      user {
        register(req: $req) {
          session { token },
          user { id, email, name }
        }
      }
    }
  `;

  userRegister(req: api.ReqUserRegister): Observable<api.RespUserRegister> {
    return this.apollo.mutate({
      mutation: GraphQLService.mUserRegister,
      variables: {
        req: {
          email: req.user.email,
          name: req.user.name,
          password: req.user.password,
          emailSubscription: req.options.email_subscription,
        }
      }
    }).map(({ data }) => {
      let response = data as graph.UserRegister;
      let res = response.user.register;
      return <api.RespUserRegister>{
        data: {
          session: {
            token: res.session.token,
          },
          user: {
            id: res.user.id,
            email: res.user.email,
            name: res.user.name,
          }
        }
      };
    }).catch((err: ApolloError) => this.translateErrorResponse(err));
  }

  // tslint:disable-next-line:member-ordering
  private static readonly mUserLogout = gql`
    mutation UserLogout {
      user{
        logout
      }
    }
  `;

  userLogout(): Observable<api.RespUserLogout> {
    return this.apollo.mutate({
      mutation: GraphQLService.mUserLogout,
      variables: {},
    }).map(({ data, errors }) => {
      if (errors) {
        throw new HttpErrorResponse({ error: errors });
      }
      return <api.RespUserLogout>{
        data: {},
      };
    }).catch((err: ApolloError) => this.translateErrorResponse(err));
  }

  userSessionRefresh(): Observable<any> {
    // TODO: not implemented
    return null;
  }

  // pads

  // tslint:disable-next-line:member-ordering
  private static readonly mPadsQueryAll = gql`
    query PadsQueryAll($req: ApiReqPadsQueryAll!) {
      pads {
        all(req: $req) {
          pageIndex
          pageSize
          total
          pads {
            id
            hash
            title
            status
            creator
            language
            createTime
            updateTime
          }
        }
      }
    }
  `;

  padsQueryAll(req: api.ReqPadsQueryAll): Observable<api.RespPadsQueryAll> {
    let variables = <graph.PadsQueryAllVariables>{
      req: {
        pageIndex: req.query.pageIndex,
        pageSize: req.query.pageSize,
        filters: req.query.filters,
      }
    };
    return this.apollo.query({
      query: GraphQLService.mPadsQueryAll,
      variables: variables,
    }).map(({ data, errors }) => {
      if (errors) {
        throw new HttpErrorResponse({ error: errors });
      }
      let res = (data as graph.PadsQueryAll).pads.all;
      return <api.RespPadsQueryAll>{
        data: res
      };
    }).catch((err: ApolloError) => this.translateErrorResponse(err));
  }

  // tslint:disable-next-line:member-ordering
  private static readonly mPadsCreate = gql`
    mutation PadsCreate($req: ApiReqPadsCreate!) {
      pads {
        create(req: $req) {
          pad {
            id
            hash
            title
            status
            creator
            language
            createTime
            updateTime
          }
        }
      }
    }
  `;

  padsCreate(req: api.ReqPadsCreate): Observable<api.RespPadsCreate> {
    let variables = <graph.PadsCreateVariables>{
      req: {
        title: req.pad.title,
        language: req.pad.language,
      }
    };
    return this.apollo.mutate({
      mutation: GraphQLService.mPadsCreate,
      variables: variables,
    }).map(({ data, errors }) => {
      if (errors) {
        throw new HttpErrorResponse({ error: errors });
      }
      let res = (data as graph.PadsCreate).pads.create;
      return <api.RespPadsCreate>{
        data: res.pad,
      };
    }).catch((err: ApolloError) => this.translateErrorResponse(err));
  }
}
