import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material';
import { Store } from '@ngrx/store';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import * as pads from 'app/website/store/dashboard/stores/pads/index';
import { PadsActionGotoPadHash } from 'app/website/store/dashboard/stores/pads/index';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import { PadFilterChange } from '../../components/pad-filter/pad-filter.component';
import { PadAction, PadActionData } from '../../components/pad-table/pad-table.component';


@Component({
  selector: 'app-pads',
  templateUrl: './pads.component.html',
  styleUrls: ['./pads.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PadsComponent implements OnInit {
  constructor(
    private store$: Store<WebsiteState>,
    private logger: LoggerService,
  ) { }

  padsState$ = this.store$.select(pads.selectDashboardPadsState);

  ngOnInit() {
    // first page
    this.store$.dispatch(new pads.PadsActionQueryAll({ pageIndex: 0, pageSize: 5, filters: {} }));
  }

  onPadActionData(actionData: PadActionData) {
    this.logger.log('actionData = ', PadAction[actionData.action], actionData.data.toObject());

    if (actionData.action === PadAction.start) {
      this.store$.dispatch(new PadsActionGotoPadHash({ hash: actionData.data.hash }));
      return;
    }

    if (actionData.action === PadAction.edit) {
      return;
    }

    if (actionData.action === PadAction.end) {
      // confirm before 'end'
      return;
    }

    if (actionData.action === PadAction.playback) {
      return;
    }

    if (actionData.action === PadAction.archive) {
      // confirm before 'archive'
      return;
    }
  }

  onPadPageEvent(event: PageEvent) {
    this.logger.log('pad page =', event);
    this.store$.dispatch(new pads.PadsActionPageChange({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    }));
  }

  onPadFilterChange(event: PadFilterChange) {
    this.logger.log('pad filter changed: ', event);
    this.store$.dispatch(new pads.PadsActionFilterChange({ ...event }));
  }
}
