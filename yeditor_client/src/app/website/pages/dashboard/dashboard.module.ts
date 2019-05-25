import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule, MatDialogModule, MatSidenavModule } from '@angular/material';
import { Route, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/website/store/auth/index';
import { DashboardStoreModule } from 'app/website/store/dashboard/dashboard-store.module';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './main/dashboard.component';
import { DashboardSharedModule } from './shared/dashboard-shared.module';


const extraModules = [
  CommonModule,
  FlexLayoutModule,
  MatSidenavModule,
  MatButtonModule,
  MatDialogModule,
];

const localRoutes: Route[] = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'pads', pathMatch: 'full' },
      { path: 'pads', loadChildren: './pages/pads/pads.module#PadsModule' },
      { path: 'questions', loadChildren: './pages/questions/questions.module#QuestionsModule' },
      { path: 'databases', loadChildren: './pages/databases/databases.module#DatabasesModule' },
      { path: 'usage', loadChildren: './pages/usage/usage.module#UsageModule' },
      { path: 'settings', loadChildren: './pages/settings/settings.module#SettingsModule' },
      { path: 'billing', loadChildren: './pages/billing/billing.module#BillingModule' },
      { path: 'team', loadChildren: './pages/team/team.module#TeamModule' },
    ]
  },
];

@NgModule({
  declarations: [
    SidebarComponent,
    DashboardComponent,
    ConfirmDialogComponent,
  ],
  entryComponents: [
    ConfirmDialogComponent,
  ],
  imports: [
    ...extraModules,
    DashboardSharedModule,
    DashboardStoreModule.forRoot(),
    RouterModule.forChild(localRoutes),
  ],
  exports: [
    RouterModule,
  ],
  providers: [
  ]
})
export class DashboardModule {

}
