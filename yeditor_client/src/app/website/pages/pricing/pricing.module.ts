import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule, MatCardModule, MatGridListModule, MatListModule } from '@angular/material';
import { Route, RouterModule } from '@angular/router';
import { FaqItemComponent } from './components/faq-item/faq-item.component';
import { PlanItemComponent } from './components/plan-item/plan-item.component';
import { PricingComponent } from './main/pricing.component';


const extraModules = [
  FlexLayoutModule,
  MatGridListModule,
  MatCardModule,
  MatButtonModule,
  MatListModule,
];

const localRoutes: Route[] = [
  { path: '', component: PricingComponent },
];

@NgModule({
  declarations: [
    PricingComponent,
    PlanItemComponent,
    FaqItemComponent,
  ],
  imports: [
    ...extraModules,
    CommonModule,
    RouterModule.forChild(localRoutes),
  ],
  exports: [
    RouterModule,
  ],
  providers: [],
})
export class PricingModule { }
