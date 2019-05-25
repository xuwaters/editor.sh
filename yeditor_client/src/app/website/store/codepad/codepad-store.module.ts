import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CodepadEffect } from './store/codepad.effect';
import { codepadStateReducer } from './store/codepad.reducer';

const EXPORT_GUARDS = [

];

const EXPORT_SERVICES = [

];

const EXPORT_EFFECTS: Type<any>[] = [
  CodepadEffect,
];

@NgModule({
  imports: [
    StoreModule.forFeature('codepad', codepadStateReducer),
    EffectsModule.forFeature(EXPORT_EFFECTS),
  ],
})
export class CodepadStoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CodepadStoreModule,
      providers: [
        ...EXPORT_GUARDS,
        ...EXPORT_SERVICES,
      ]
    };
  }
}
