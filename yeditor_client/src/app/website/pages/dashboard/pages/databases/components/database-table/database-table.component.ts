import { Database } from 'app/website/store/dashboard/stores/databases/databases.model';

import {
  Component, OnInit, ViewChild, Input, Output, EventEmitter,
  AfterViewInit, ChangeDetectionStrategy
} from '@angular/core';

import { MatPaginator, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-database-table',
  templateUrl: './database-table.component.html',
  styleUrls: ['./database-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatabaseTableComponent implements OnInit, AfterViewInit {
  constructor() { }

  @ViewChild(MatPaginator) private paginator: MatPaginator;

  private _dataLength: number;

  databasesDataSource = new MatTableDataSource<Database>();
  currentColumns = ['title', 'status', 'engine', 'description', 'actions'];

  @Output() action = new EventEmitter<DatabaseActionData>();

  @Input('data')
  set data(value: Database[]) {
    this.databasesDataSource.data = value;
    this.dataLength = value.length;
  }

  get data(): Database[] {
    return this.databasesDataSource.data;
  }

  @Input('dataLength')
  set dataLength(value: number) {
    this._dataLength = value;
  }

  get dataLength(): number {
    return this._dataLength;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.databasesDataSource.paginator = this.paginator;
  }

  onAction(actionName: string, database: Database) {
    this.action.next(new DatabaseActionData(actionName, database));
  }
}

export class DatabaseActionData {
  constructor(
    public action: string,
    public database: Database,
  ) { }
}
