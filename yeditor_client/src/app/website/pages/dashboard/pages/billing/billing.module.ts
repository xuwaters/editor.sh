import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Route, RouterModule } from '@angular/router';
import { DashboardSharedModule } from './../../shared/dashboard-shared.module';
import { BillingListComponent } from './list/billing-list.component';
import { BillingPlansComponent } from './plans/billing-plans.component';

const extraModules = [
  FlexLayoutModule,
];

const localRoutes: Route[] = [
  { path: '', component: BillingListComponent, pathMatch: 'full' },
  { path: 'plans', component: BillingPlansComponent },
];

@NgModule({
  declarations: [
    BillingListComponent,
    BillingPlansComponent,
  ],
  imports: [
    ...extraModules,
    DashboardSharedModule,
    RouterModule.forChild(localRoutes),
  ],
  exports: [
    RouterModule,
  ],
  providers: [],
})
export class BillingModule { }
