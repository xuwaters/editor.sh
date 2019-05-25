import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import * as auth from 'app/website/store/auth/index';
import { WebsiteState } from 'app/website/store/website-store.reducer';

@Component({
  selector: 'app-account-register',
  templateUrl: './account-register.component.html',
  styleUrls: ['./account-register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountRegisterComponent implements OnInit {
  constructor(
    private store$: Store<WebsiteState>,
    private logger: LoggerService,
  ) { }

  userEmail = '';
  userName = '';
  userPassword = '';
  enableSendEmails = true;

  pending$ = this.store$.select(auth.selectAuthLoginStatePending);

  errorsField$ = this.store$.select(auth.selectAuthLoginStateErrorsField);
  errorEmail$ = this.errorsField$.map(f => f('email'));
  errorName$ = this.errorsField$.map(f => f('name'));
  errorPassword$ = this.errorsField$.map(f => f('password'));

  ngOnInit() { }

  onRegister() {
    this.store$.dispatch(new auth.AuthActionRegister({
      email: this.userEmail,
      name: this.userName,
      password: this.userPassword,
      options: { email_subscription: this.enableSendEmails },
    }));
  }
}
