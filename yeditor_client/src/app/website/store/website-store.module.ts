import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'environments/environment';
import { AuthStoreModule } from './auth/auth-store.module';
import { CommonStoreModule } from './common/common-store.module';
import { websiteMetaReducers, websiteReducers } from './website-store.reducer';

@NgModule({
  declarations: [],
  imports: [
    // store
    StoreModule.forRoot(websiteReducers, { metaReducers: websiteMetaReducers }),
    environment.production ? [] : StoreDevtoolsModule.instrument({ maxAge: 20 }),
    // Effects
    EffectsModule.forRoot([]),
    // globally available stores
    CommonStoreModule.forRoot(),
    AuthStoreModule.forRoot(),
  ],
  exports: [],
  providers: [],
})
export class WebsiteStoreModule {

}
