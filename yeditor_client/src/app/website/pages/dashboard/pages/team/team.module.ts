import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Route, RouterModule } from '@angular/router';
import { DashboardSharedModule } from '../../shared/dashboard-shared.module';
import { TeamCreateComponent } from './create/team-create.component';
import { TeamListComponent } from './list/team-list.component';


const extraModules = [
  FlexLayoutModule,
];

const localRoutes: Route[] = [
  { path: '', component: TeamListComponent, pathMatch: 'full' },
  { path: 'create', component: TeamCreateComponent },
];

@NgModule({
  declarations: [
    TeamCreateComponent,
    TeamListComponent,
  ],
  imports: [
    ...extraModules,
    DashboardSharedModule,
    RouterModule.forChild(localRoutes),
  ],
  exports: [
    RouterModule,
  ],
  providers: [],
})
export class TeamModule { }
