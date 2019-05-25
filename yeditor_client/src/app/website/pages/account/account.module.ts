import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { //
  MatButtonModule, MatCardModule, MatCheckboxModule, //
  MatFormFieldModule, MatIconModule, MatInputModule
} from '@angular/material';
import { Route, RouterModule } from '@angular/router';
import { CommonUiModule } from 'app/website/shared-ui/common-ui/common-ui.module';
import { AccountLinksComponent } from './layout/links/account-links.component';
import { AccountLayoutComponent } from './layout/main/account-layout.component';
import { AccountConfirmationComponent } from './pages/confirmation/account-confirmation.component';
import { AccountLogin3rdComponent } from './pages/login-3rd/account-login-3rd.component';
import { AccountLoginComponent } from './pages/login/account-login.component';
import { AccountOAuthComponent } from './pages/oauth/account-oauth.component';
import { AccountPasswordChangeComponent } from './pages/password-change/account-password-change.component';
import { AccountPasswordResetComponent } from './pages/password-reset/account-password-reset.component';
import { AccountRegisterComponent } from './pages/register/account-register.component';
import { AccountUnlockComponent } from './pages/unlock/account-unlock.component';


const extraModules = [
  CommonUiModule,
  CommonModule,
  FormsModule,
  FlexLayoutModule,
  MatCardModule,
  MatButtonModule,
  MatInputModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatIconModule,
];

const localRoutes: Route[] = [
  {
    path: '',
    component: AccountLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: AccountLogin3rdComponent },
      { path: 'oauth/:platform', component: AccountOAuthComponent },
      { path: 'register', component: AccountRegisterComponent },
      { path: 'login-local', component: AccountLoginComponent },
      { path: 'password-change', component: AccountPasswordChangeComponent },
      { path: 'password-reset', component: AccountPasswordResetComponent },
      { path: 'confirmation', component: AccountConfirmationComponent },
      { path: 'unlock', component: AccountUnlockComponent },
    ]
  },
];

@NgModule({
  declarations: [
    AccountLogin3rdComponent,
    AccountOAuthComponent,
    AccountLinksComponent,
    AccountLayoutComponent,
    AccountLoginComponent,
    AccountRegisterComponent,
    AccountPasswordChangeComponent,
    AccountPasswordResetComponent,
    AccountConfirmationComponent,
    AccountUnlockComponent,
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
export class AccountModule {

}
