import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AuthEffect } from './store/auth.effect';
import { AuthGuard } from './store/auth.guard';
import { authStateReducer } from './store/auth.reducer';

const EXPORT_GUARDS = [
  AuthGuard,
];

const EXPORT_SERVICES = [
];

const EXPORT_EFFECTS: Type<any>[] = [
  AuthEffect,
];

@NgModule({
  imports: [
    StoreModule.forFeature('auth', authStateReducer),
    EffectsModule.forFeature(EXPORT_EFFECTS),
  ]
})
export class AuthStoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AuthStoreModule,
      providers: [
        ...EXPORT_GUARDS,
        ...EXPORT_SERVICES,
      ],
    };
  }
}
