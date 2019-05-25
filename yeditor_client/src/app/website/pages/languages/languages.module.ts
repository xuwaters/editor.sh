import { MatButtonModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LanguagesComponent } from './main/languages.component';

import { Route, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

const extraModules = [
  FlexLayoutModule,
  MatButtonModule,
];

const localRoutes: Route[] = [
  { path: '', component: LanguagesComponent },
];

@NgModule({
  declarations: [
    LanguagesComponent,
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
export class LanguagesModule { }
