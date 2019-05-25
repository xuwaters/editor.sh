import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ConfigService } from '../../../../shared/services/common/config.service';

@Component({
  selector: 'app-account-password-reset',
  templateUrl: './account-password-reset.component.html',
  styleUrls: ['./account-password-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPasswordResetComponent implements OnInit {
  constructor(
    public config: ConfigService
  ) {
  }

  userEmail = '';

  ngOnInit() { }

  onResetPassword() {

  }
}
