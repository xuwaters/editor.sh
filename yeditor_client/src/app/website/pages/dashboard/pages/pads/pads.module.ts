import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { //
  MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSelectModule, MatTableModule
} from '@angular/material';
import { Route, RouterModule } from '@angular/router';
import { MomentModule } from 'angular2-moment';
import { PadFilterComponent } from './components/pad-filter/pad-filter.component';
import { PadTableComponent } from './components/pad-table/pad-table.component';
import { PadsComponent } from './pages/main/pads.component';

const extraModules = [
  CommonModule,
  MomentModule,
  FormsModule,
  FlexLayoutModule,
  MatTableModule,
  MatPaginatorModule,
  MatCardModule,
  MatButtonModule,
  MatSelectModule,
  MatFormFieldModule,
  MatInputModule,
];

const localRoutes: Route[] = [
  { path: '', component: PadsComponent, pathMatch: 'full' },
];

@NgModule({
  declarations: [
    PadsComponent,
    PadTableComponent,
    PadFilterComponent,
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
export class PadsModule { }
