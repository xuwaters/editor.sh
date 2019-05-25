import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import * as common from 'app/website/store/common/index';
import * as databases from 'app/website/store/dashboard/stores/databases/index';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-databases-show',
  templateUrl: './databases-show.component.html',
  styleUrls: ['./databases-show.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatabasesShowComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store$: Store<WebsiteState>,
    private logger: LoggerService,
  ) { }

  database$: Observable<databases.Database>;
  databaseSummary$: Observable<string>;
  databaseTitle$: Observable<string>;
  databaseDescription$: Observable<string>;
  databaseScript$: Observable<string>;

  private databaseId: number;

  ngOnInit() {
    const paramMap = this.activatedRoute.snapshot.paramMap;
    this.databaseId = parseInt(paramMap.get('database_id'), 10);
    if (isNaN(this.databaseId)) {
      this.store$.dispatch(new common.CommonActionSnackBarMessage({ message: 'Database not found' }));
      this.router.navigate(['/dashboard/databases']);
      return;
    }
    this.logger.log('show database id = ', this.databaseId);
    this.database$ = this.store$.select(databases.selectDashboardDatabasesStateAllDatabases).map(it => it.get(this.databaseId));
    this.databaseSummary$ = this.database$.map(it => it ? it.summary : '');
    this.databaseTitle$ = this.database$.map(it => it ? it.title : '');
    this.databaseDescription$ = this.database$.map(it => it ? it.description : '');
    this.databaseScript$ = this.database$.map(it => it ? it.script : '');
  }

  onEditDatabase() {
    if (isNaN(this.databaseId)) {
      this.router.navigate(['/dashboard/databases']);
    } else {
      this.router.navigate(['/dashboard/databases/edit', this.databaseId]);
    }
  }
}
