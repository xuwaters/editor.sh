import { NgModule } from '@angular/core';
import { PlansComponent } from './plans/plans.component';

@NgModule({
  declarations: [
    PlansComponent,
  ],
  exports: [
    PlansComponent,
  ]
})
export class DashboardSharedModule {
}
