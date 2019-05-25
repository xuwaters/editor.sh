import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthActionOAuthQueryUrl } from 'app/website/store/auth';
import { WebsiteState } from 'app/website/store/website-store.reducer';

@Component({
  selector: 'app-signin-github',
  templateUrl: './signin-github.component.html',
  styleUrls: ['./signin-github.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SigninGithubComponent implements OnInit {
  constructor(
    private store$: Store<WebsiteState>,
  ) { }

  ngOnInit(): void {
  }

  onLoginGithub(): void {
    this.store$.dispatch(new AuthActionOAuthQueryUrl({ platform: 'github' }));
  }
}
