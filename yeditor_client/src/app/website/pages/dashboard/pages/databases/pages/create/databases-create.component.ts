import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as databases from 'app/website/store/dashboard/stores/databases/index';
import { WebsiteState } from 'app/website/store/website-store.reducer';

@Component({
  selector: 'app-databases-create',
  templateUrl: './databases-create.component.html',
  styleUrls: ['./databases-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatabasesCreateComponent implements OnInit {
  constructor(
    private store$: Store<WebsiteState>,
  ) { }

  ngOnInit() { }

  onSave(currDatabase: databases.Database) {
    this.store$.dispatch(new databases.DatabasesActionSave({ database: currDatabase }));
  }

}
