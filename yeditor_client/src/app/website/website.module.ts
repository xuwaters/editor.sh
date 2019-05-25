import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { //
  MatButtonModule, MatCardModule, MatGridListModule, MatListModule, MatSnackBarModule, MatToolbarModule
} from '@angular/material';
import { Route, RouterModule } from '@angular/router';
import { NgProgressModule } from '@ngx-progressbar/core';
import { WebsiteFooterComponent } from './layout/footer/website-footer.component';
import { WebsiteHeaderComponent } from './layout/header/website-header.component';
import { WebsiteLayoutComponent } from './layout/main/website-layout.component';
import { WebsiteComponent } from './layout/main/website.component';
import { WebsiteSharedModule } from './shared/website-shared.module';
import { WebsiteStoreModule } from './store/website-store.module';



const extraModules = [
  CommonModule,
  FlexLayoutModule,
  MatToolbarModule,
  MatButtonModule,
  MatCardModule,
  MatListModule,
  MatGridListModule,
  MatSnackBarModule,
];

const localRoutes: Route[] = [
  {
    path: '', component: WebsiteLayoutComponent, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadChildren: './pages/home/home.module#HomeModule' },
      { path: 'features', loadChildren: './pages/features/features.module#FeaturesModule' },
      { path: 'pricing', loadChildren: './pages/pricing/pricing.module#PricingModule' },
      { path: 'dashboard', loadChildren: './pages/dashboard/dashboard.module#DashboardModule' },
      { path: 'languages', loadChildren: './pages/languages/languages.module#LanguagesModule' },
      { path: 'help', loadChildren: './pages/help/help.module#HelpModule' },
      { path: 'about', loadChildren: './pages/about/about.module#AboutModule' },
    ]
  },
  { path: 'error', loadChildren: './pages/error/error.module#ErrorModule' },
  { path: 'account', loadChildren: './pages/account/account.module#AccountModule' },
  { path: ':hashcode', loadChildren: './pages/codepad/codepad.module#CodepadModule' },
  { path: '**', redirectTo: '/error' },
];

@NgModule({
  declarations: [
    WebsiteHeaderComponent,
    WebsiteFooterComponent,
    WebsiteLayoutComponent,
    WebsiteComponent,
  ],
  imports: [
    ...extraModules,
    RouterModule.forRoot(localRoutes, { enableTracing: false, useHash: false }),
    NgProgressModule,
    WebsiteSharedModule.forRoot(),
    WebsiteStoreModule,
  ],
  exports: [
    RouterModule,
    WebsiteComponent,
  ]
})
export class WebsiteModule {}
