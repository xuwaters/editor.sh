import { //
  AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild
} from '@angular/core';
import { MatPaginator, MatTableDataSource, PageEvent } from '@angular/material';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { Pad } from 'app/website/store/dashboard/stores/pads/pads.model';
import { PadsStateParams } from 'app/website/store/dashboard/stores/pads/pads.reducer';


@Component({
  selector: 'app-pad-table',
  templateUrl: './pad-table.component.html',
  styleUrls: ['./pad-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PadTableComponent implements OnInit, AfterViewInit {

  constructor(
    private logger: LoggerService,
  ) { }

  @ViewChild(MatPaginator) private paginator: MatPaginator;

  private _data: PadsStateParams;

  padsDataSource = new MatTableDataSource<Pad>();
  // currentColumns = ['title', 'status', 'creator', 'createTime', 'language', 'actions'];
  currentColumns = ['title', 'createTime', 'language', 'actions'];
  dataPageSizeOptions = [5, 10, 25];

  @Output()
  action = new EventEmitter<PadActionData>();

  @Output()
  page = new EventEmitter<PageEvent>();

  @Input('data')
  set data(value: PadsStateParams) {
    this._data = value;
    this.padsDataSource.data = (this._data.pads ? this._data.pads.toArray() : []);
  }

  get data(): PadsStateParams {
    return this._data;
  }

  get dataLength(): number {
    return this.data.total ? this.data.total : 0;
  }

  get dataPageSize(): number {
    return this.data.pageSize ? this.data.pageSize : 0;
  }

  get dataPageIndex(): number {
    return this.data.pageIndex ? this.data.pageIndex : 0;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  onAction(actionName: string, padData: Pad) {
    this.action.next(new PadActionData(PadAction[actionName], padData));
  }

  onPage(event: PageEvent) {
    this.page.next(event);
  }
}

export enum PadAction {
  start = 1,
  edit = 2,
  end = 3,
  playback = 4,
  archive = 5,
}

export class PadActionData {
  constructor(
    public action: PadAction,
    public data: Pad
  ) { }
}
