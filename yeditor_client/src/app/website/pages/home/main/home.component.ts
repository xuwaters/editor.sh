import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { ConfigService } from 'app/website/shared/services/common/config.service';
import * as auth from 'app/website/store/auth/index';
import { WebsiteState } from 'app/website/store/website-store.reducer';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {

  constructor(
    public config: ConfigService,
    private store$: Store<WebsiteState>,
  ) { }

  loggedIn$ = this.store$.select(auth.selectAuthUserStateLoggedIn);

}
