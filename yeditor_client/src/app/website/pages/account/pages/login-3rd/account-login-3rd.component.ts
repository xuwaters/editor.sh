import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ConfigService } from 'app/website/shared/services/common/config.service';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { WebsiteState } from 'app/website/store/website-store.reducer';


@Component({
  selector: 'app-account-login-3rd',
  templateUrl: './account-login-3rd.component.html',
  styleUrls: ['./account-login-3rd.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountLogin3rdComponent implements OnInit {
  constructor(
    private router: Router,
    private store$: Store<WebsiteState>,
    private logger: LoggerService,
    private config: ConfigService,
  ) { }

  ngOnInit(): void {
  }
}
