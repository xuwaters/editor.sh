import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ConfigService } from 'app/website/shared/services/common/config.service';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import * as databases from 'app/website/store/dashboard/stores/databases/index';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import { DatabaseActionData } from '../../components/database-table/database-table.component';

@Component({
  selector: 'app-databases-list',
  templateUrl: './databases-list.component.html',
  styleUrls: ['./databases-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatabasesListComponent implements OnInit {
  constructor(
    private router: Router,
    public config: ConfigService,
    private store$: Store<WebsiteState>,
    private logger: LoggerService,
  ) { }

  databaseList$ = this.store$.select(databases.selectDashboardDatabasesStateAllDatabases).map(it => it.toArray());

  ngOnInit() {
    this.store$.dispatch(new databases.DatabasesActionQueryAll());
  }

  onDatabaseAction(data: DatabaseActionData) {
    this.logger.log('database action = ', data);
    if (data.action === 'show') {
      this.router.navigate(['/dashboard/databases/show', data.database.id]);
    } else if (data.action === 'delete') {
      this.store$.dispatch(new databases.DatabasesActionDelete({ database: data.database }));
    }
  }
}
