import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { JwtService } from 'app/website/shared/services/api/jwt.service';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';
import { WebsiteState } from '../../website-store.reducer';
import { AuthActionLoginRedirect } from './auth.action';
import { selectAuthUserStateLoggedIn } from './auth.selector';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private store$: Store<WebsiteState>,
    private jwtService: JwtService,
  ) { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.store$
      .select(selectAuthUserStateLoggedIn)
      .map(loggedIn => {
        if (!loggedIn) {
          this.store$.dispatch(new AuthActionLoginRedirect());
          return false;
        }
        return true;
      })
      .take(1);
  }

}
