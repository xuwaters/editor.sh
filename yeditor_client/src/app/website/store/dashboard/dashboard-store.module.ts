import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { dashboardReducer } from './reducers/dashboard.reducer';
import { PadsEffect } from './stores/pads/pads.effect';
import { QuestionsEffect } from './stores/questions/questions.effect';
import { DatabasesEffect } from './stores/databases/databases.effect';
import { SettingsEffect } from './stores/settings/settings.effect';

const EXPORT_GUARDS = [];
const EXPORT_SERVICES = [];
const EXPORT_EFFECTS: Type<any>[] = [
  DatabasesEffect,
  PadsEffect,
  QuestionsEffect,
  SettingsEffect,
];

@NgModule({
  imports: [
    StoreModule.forFeature('dashboard', dashboardReducer),
    EffectsModule.forFeature(EXPORT_EFFECTS),
  ]
})
export class DashboardStoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DashboardStoreModule,
      providers: [
        ...EXPORT_GUARDS,
        ...EXPORT_SERVICES,
      ]
    };
  }
}
