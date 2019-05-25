import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgProgress, NgProgressRef } from '@ngx-progressbar/core';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import * as common from 'app/website/store/common/index';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-website',
  template: `
  <ng-progress [id]="globalProgressBarId"></ng-progress>
  <router-outlet></router-outlet>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebsiteComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private router: Router,
    private progress: NgProgress,
    private store$: Store<WebsiteState>,
    private snackBar: MatSnackBar,
    private logger: LoggerService,
  ) { }

  globalProgressBarId = 'global-progress-bar';

  private subscriptions: Subscription[] = [];

  private snackBarMessage$ = this.store$.select(common.selectCommonStateSnackBarMessage);

  ngOnInit() {
    // this.store$.dispatch(new auth.AuthActionRefreshToken());
  }

  ngOnDestroy() {
    this.destroyRouterEventsHandler();
  }

  ngAfterViewInit() {
    //
    this.subscriptions.push(this.snackBarMessage$.subscribe(msg => {
      if (!msg || !msg.message) {
        return;
      }
      this.logger.log('snackbar message: ', msg);
      this.snackBar.open(msg.message, msg.action, {
        duration: 5000,
        verticalPosition: 'top'
      });
      this.store$.dispatch(new common.CommonActionSnackBarMessageReset());
    }));
    //
    this.initRouterEventsHandler();
  }

  private destroyRouterEventsHandler() {
    this.subscriptions.forEach(it => it.unsubscribe());
    this.subscriptions = [];
  }

  private get globalProgressBar(): NgProgressRef {
    return this.progress.ref(this.globalProgressBarId);
  }

  private initRouterEventsHandler() {
    const handleRouterEvent = event => {
      if (event instanceof NavigationStart) {
        this.globalProgressBar.start();
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.globalProgressBar.complete();
      }
    };
    this.subscriptions.push(this.router.events.subscribe(handleRouterEvent));
  }
}
