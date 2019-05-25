import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import * as common from 'app/website/store/common/index';
import * as databases from 'app/website/store/dashboard/stores/databases/index';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-databases-edit',
  templateUrl: './databases-edit.component.html',
  styleUrls: ['./databases-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatabasesEditComponent implements OnInit {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store$: Store<WebsiteState>,
    private logger: LoggerService,
  ) { }

  database$: Observable<databases.Database>;
  databaseTitle$: Observable<string>;

  private databaseId: number;

  ngOnInit() {
    const paramMap = this.activatedRoute.snapshot.paramMap;
    this.databaseId = parseInt(paramMap.get('database_id'), 10);
    if (isNaN(this.databaseId) || this.databaseId <= 0) {
      this.store$.dispatch(new common.CommonActionSnackBarMessage({ message: 'Database not found' }));
      this.router.navigate(['/dashboard/databases']);
      return;
    }
    this.logger.log('edit database id = ', this.databaseId);
    this.database$ = this.store$.select(databases.selectDashboardDatabasesStateAllDatabases).map(it => it.get(this.databaseId));
    this.databaseTitle$ = this.database$.map(it => it && it.title || '');
  }

  onSave(currDatabase: databases.Database) {
    this.store$.dispatch(new databases.DatabasesActionSave({ database: currDatabase }));
  }

}
