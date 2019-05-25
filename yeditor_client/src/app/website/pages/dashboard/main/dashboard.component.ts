import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { CommonActionConfirmDialog, selectCommonStateConfirmData } from 'app/website/store/common';
import { ConfirmData } from 'app/website/store/common/store/common.model';
import { PadsActionCreatePad } from 'app/website/store/dashboard/stores/pads';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  constructor(
    private router: Router,
    private logger: LoggerService,
    private store$: Store<WebsiteState>,
    private dialog: MatDialog,
  ) { }

  confirmData$: Observable<ConfirmData> = this.store$.select(selectCommonStateConfirmData);

  private subscriptions: Subscription[] = [];

  ngAfterViewInit(): void {
    this.subscriptions.push(this.confirmData$.subscribe(it => this.handleConfirmData(it)));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(it => it && it.unsubscribe());
    this.subscriptions = [];
  }

  onCreatePad() {
    // this.logger.log('create pad');
    this.store$.dispatch(new PadsActionCreatePad({}));
  }

  onTrySandbox() {
    this.router.navigate(['/sandbox']);
  }

  private handleConfirmData(data: ConfirmData) {
    if (data) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        height: '200px',
        data: data
      });
      dialogRef.afterClosed().subscribe(result => {
        if (data.afterClose) {
          data.afterClose(result);
          // cleanup
          this.store$.dispatch(new CommonActionConfirmDialog(null));
        }
      });
    }
  }
}
