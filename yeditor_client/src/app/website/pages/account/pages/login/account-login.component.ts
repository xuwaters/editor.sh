import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import * as auth from 'app/website/store/auth/index';
import { WebsiteState } from 'app/website/store/website-store.reducer';

@Component({
  selector: 'app-account-login',
  templateUrl: './account-login.component.html',
  styleUrls: ['./account-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountLoginComponent implements OnInit {
  constructor(
    private router: Router,
    private store$: Store<WebsiteState>,
    private logger: LoggerService,
  ) { }

  userEmail = '';
  userPassword = '';

  pending$ = this.store$.select(auth.selectAuthLoginStatePending);

  errorsField$ = this.store$.select(auth.selectAuthLoginStateErrorsField);
  errorEmail$ = this.errorsField$.map(f => f('email'));
  errorPassword$ = this.errorsField$.map(f => f('password'));

  ngOnInit() {
  }

  onLogin() {
    // this.logger.log('login: email = ', this.userEmail, ', password = ', this.userPassword);
    this.store$.dispatch(new auth.AuthActionLogin({ email: this.userEmail, password: this.userPassword }));
  }
}
