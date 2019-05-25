import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material';
import { Route, RouterModule } from '@angular/router';
import { CommonUiModule } from 'app/website/shared-ui/common-ui/common-ui.module';
import { HomeComponent } from './main/home.component';


const extraModules = [
  CommonModule,
  FlexLayoutModule,
  MatButtonModule,
  CommonUiModule,
];

const localRoutes: Route[] = [
  { path: '', component: HomeComponent },
];

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    ...extraModules,
    RouterModule.forChild(localRoutes),
  ],
  exports: []
})
export class HomeModule {
}
