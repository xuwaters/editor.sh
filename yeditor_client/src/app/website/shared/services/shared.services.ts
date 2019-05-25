import { Provider } from '@angular/core';
import { ApiService, API_CONFIG, ApiConfig } from './api/api.service';
import { CodepadService } from './codepad/codepad.service';
import { ConfigService } from './common/config.service';
import { CommonService } from './common/common.service';
import { PlatformService } from './common/platform.service';
import { LoggerService } from './common/logger.service';
import { JwtService } from './api/jwt.service';
import { GraphQLService, createApollo } from './api/graphql.service';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';

export const SHARED_PROVIDERS: Provider[] = [
  PlatformService,
  LoggerService,
  CommonService,
  ConfigService,
  CodepadService,
  JwtService,
  ApiService,
  GraphQLService,
  {
    provide: API_CONFIG,
    useValue: <ApiConfig>{
      apiKey: '',
      apiUrl: '/api/v1/{action}',
      socketUrl: '/socket',
    }
  },
  {
    provide: APOLLO_OPTIONS,
    useFactory: createApollo,
    deps: [HttpLink],
  },
];
