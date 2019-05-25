import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import { AuthActionOAuthLogin } from 'app/website/store/auth';


@Component({
  selector: 'app-account-oauth',
  templateUrl: './account-oauth.component.html',
  styleUrls: ['./account-oauth.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOAuthComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private logger: LoggerService,
    private store$: Store<WebsiteState>,
  ) {
  }

  ngOnInit(): void {
    let snapshot = this.activatedRoute.snapshot;
    const paramMap = snapshot.paramMap;
    const queryParamMap = snapshot.queryParamMap;
    let platform = paramMap.get('platform');
    let code = queryParamMap.get('code');
    // this.logger.log('platform =', platform, ', code = ', code);

    this.store$.dispatch(new AuthActionOAuthLogin({
      platform: platform,
      code: code,
    }));
  }

}
