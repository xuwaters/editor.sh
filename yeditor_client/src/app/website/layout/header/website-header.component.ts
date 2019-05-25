import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as auth from 'app/website/store/auth/index';
import { WebsiteState } from 'app/website/store/website-store.reducer';

@Component({
  selector: 'app-website-header',
  templateUrl: './website-header.component.html',
  styleUrls: ['./website-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebsiteHeaderComponent implements OnInit {
  constructor(
    private store$: Store<WebsiteState>,
  ) { }

  loggedIn$ = this.store$.select(auth.selectAuthUserStateLoggedIn);

  ngOnInit() {

  }

  onLogout() {
    this.store$.dispatch(new auth.AuthActionLogout());
  }
}
