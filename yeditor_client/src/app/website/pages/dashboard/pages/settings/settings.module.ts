import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { Route, RouterModule } from '@angular/router';
import { LanguageSelectorModule } from 'app/website/shared-ui/language-selector/language-selector.module';
import { SettingsComponent } from './main/settings.component';


const extraModules = [
  CommonModule,
  LanguageSelectorModule,
  FormsModule,
  FlexLayoutModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatCheckboxModule,
];

const localRoutes: Route[] = [
  { path: '', component: SettingsComponent, pathMatch: 'full' },
];

@NgModule({
  declarations: [
    SettingsComponent,
  ],
  imports: [
    ...extraModules,
    RouterModule.forChild(localRoutes),
  ],
  exports: [
    RouterModule,
  ],
  providers: [],
})
export class SettingsModule { }
