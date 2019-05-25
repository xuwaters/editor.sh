import { FlexLayoutModule } from '@angular/flex-layout';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component';
import { TestimonialsComponent } from './pages/testimonials/testimonials.component';

import { Route, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

const extraModules = [
  FlexLayoutModule,
];

const localRoutes: Route[] = [
  { path: 'testimonials', component: TestimonialsComponent, },
  { path: 'terms-of-service', component: TermsOfServiceComponent, },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
];

@NgModule({
  declarations: [
    TestimonialsComponent,
    TermsOfServiceComponent,
    PrivacyPolicyComponent,
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
export class AboutModule { }
