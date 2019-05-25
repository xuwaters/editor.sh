import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { //
  MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSelectModule, MatTableModule
} from '@angular/material';
import { Route, RouterModule } from '@angular/router';
import { MonacoEditorModule } from 'app/website/shared-ui/monaco-editor/monaco-editor.module';
import { DatabaseEditorComponent } from './components/database-editor/database-editor.component';
import { DatabaseTableComponent } from './components/database-table/database-table.component';
import { DatabasesCreateComponent } from './pages/create/databases-create.component';
import { DatabasesEditComponent } from './pages/edit/databases-edit.component';
import { DatabasesListComponent } from './pages/list/databases-list.component';
import { DatabasesShowComponent } from './pages/show/databases-show.component';



const extraModules = [
  MonacoEditorModule,
  CommonModule,
  FormsModule,
  FlexLayoutModule,
  MatTableModule,
  MatPaginatorModule,
  MatCardModule,
  MatButtonModule,
  MatFormFieldModule,
  MatSelectModule,
  MatInputModule,
];

const localRoutes: Route[] = [
  { path: '', component: DatabasesListComponent, pathMatch: 'full' },
  { path: 'create', component: DatabasesCreateComponent },
  { path: 'edit/:database_id', component: DatabasesEditComponent },
  { path: 'show/:database_id', component: DatabasesShowComponent },
];

@NgModule({
  declarations: [
    DatabaseTableComponent,
    DatabaseEditorComponent,
    //
    DatabasesListComponent,
    DatabasesEditComponent,
    DatabasesShowComponent,
    DatabasesCreateComponent,
  ],
  imports: [
    ...extraModules,
    RouterModule.forChild(localRoutes),
  ],
  exports: [
    RouterModule,
  ],
  providers: [],
})
export class DatabasesModule { }
