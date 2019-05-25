import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material';
import { Route, RouterModule } from '@angular/router';
import { FeaturesComponent } from './main/features.component';


const extraModules = [
  FlexLayoutModule,
  MatButtonModule,
];

const localRoutes: Route[] = [
  { path: '', component: FeaturesComponent },
];

@NgModule({
  declarations: [
    FeaturesComponent,
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
export class FeaturesModule { }
