import { commonStateReducer } from './store/common.reducer';
import { CommonEffect } from './store/common.effect';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NgModule, ModuleWithProviders, Type } from '@angular/core';

const EXPORT_GUARDS = [
];

const EXPORT_SERVICES = [
];

const EXPORT_EFFECTS: Type<any>[] = [
  CommonEffect,
];

@NgModule({
  imports: [
    StoreModule.forFeature('common', commonStateReducer),
    EffectsModule.forFeature(EXPORT_EFFECTS),
  ]
})
export class CommonStoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CommonStoreModule,
      providers: [
        ...EXPORT_GUARDS,
        ...EXPORT_SERVICES,
      ],
    };
  }
}
