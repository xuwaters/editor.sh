import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule, MatPaginatorModule, MatTableModule } from '@angular/material';
import { Route, RouterModule } from '@angular/router';
import { UsageComponent } from './main/usage.component';


const extraModules = [
  FlexLayoutModule,
  MatTableModule,
  MatPaginatorModule,
  MatCardModule,
];

const localRoutes: Route[] = [
  { path: '', component: UsageComponent, pathMatch: 'full' },
];

@NgModule({
  declarations: [
    UsageComponent,
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
export class UsageModule { }
