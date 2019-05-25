
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { PadStatusList } from 'app/website/store/dashboard/stores/pads/pads.model';

export interface PadFilterChange {
  search: string;
  status: string;
  days: string;
}

@Component({
  selector: 'app-pad-filter',
  templateUrl: './pad-filter.component.html',
  styleUrls: ['./pad-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PadFilterComponent implements OnInit {
  constructor(
    private logger: LoggerService,
  ) { }

  // output events

  @Output() filterChange = new EventEmitter<PadFilterChange>();


  // search
  currentSearch = '';

  // status
  statusList = [
    { value: '', name: 'Any pad status' },
    ...PadStatusList
  ];

  currentStatus = '';

  // create time
  createDaysList = [
    { value: '', name: 'Created anytime' },
    { value: '1', name: 'Last day' },
    { value: '7', name: 'Last 7 days' },
    { value: '30', name: 'Last 30 days' },
    { value: '90', name: 'Last 90 days' },
    { value: '180', name: 'Last 180 days' },
    { value: '365', name: 'Last 365 days' },
  ];

  currentCreateDays = '';

  ngOnInit(): void {
  }

  get currentFilter(): PadFilterChange {
    return {
      search: this.currentSearch,
      status: this.currentStatus,
      days: this.currentCreateDays,
    };
  }

  onFilterSearchChanged(event: Event) {
    // this.logger.log('search chagned = ', event);
    this.filterChange.next(this.currentFilter);
  }

  onFilterPadStatusChanged(event: MatSelectChange) {
    // this.logger.log('pad status changed =', event.value, ', status =', this.currentStatus);
    this.filterChange.next(this.currentFilter);
  }

  onFilterCreateTimeChanged(event: MatSelectChange) {
    // this.logger.log('create time changed =', event.value, ', create time =', this.currentCreateTime);
    this.filterChange.next(this.currentFilter);
  }

}
