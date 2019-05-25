import { NgModule } from '@angular/core';
import { MatButtonModule, MatCardModule } from '@angular/material';
import { Route, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './main/page-not-found.component';


const extraModules = [
  MatButtonModule,
  MatCardModule,
];


const localRoutes: Route[] = [
  { path: '', component: PageNotFoundComponent },
];

@NgModule({
  declarations: [
    PageNotFoundComponent,
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
export class ErrorModule { }
