import { NgModule, ModuleWithProviders } from '@angular/core';
import { SHARED_PROVIDERS } from './services/shared.services';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { ApolloModule } from 'apollo-angular';
import { HttpLinkModule } from 'apollo-angular-link-http';

@NgModule({
  declarations: [],
  imports: [
    HttpModule,
    HttpClientModule,
  ],
  exports: [
    ApolloModule,
    HttpLinkModule
  ],
})
export class WebsiteSharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: WebsiteSharedModule,
      providers: [
        ...SHARED_PROVIDERS,
      ]
    };
  }
}
