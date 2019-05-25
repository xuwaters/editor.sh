import { HelpCandidatesComponent } from './pages/candidates/help-candidates.component';
import { HelpRecruitersComponent } from './pages/recruiters/help-recruiters.component';
import { HelpInterviewserComponent } from './pages/interviewers/help-interviewers.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

const extraModules = [
  FlexLayoutModule,
];

const localRoutes: Route[] = [
  { path: 'getting-started-interviewers', component: HelpInterviewserComponent },
  { path: 'getting-started-recruiters', component: HelpRecruitersComponent },
  { path: 'getting-started-candidates', component: HelpCandidatesComponent },
];

@NgModule({
  declarations: [
    HelpInterviewserComponent,
    HelpRecruitersComponent,
    HelpCandidatesComponent,
  ],
  imports: [
    ...extraModules,
    CommonModule,
    RouterModule.forChild(localRoutes),
  ],
  exports: [
    RouterModule,
  ],
  providers: [],
})
export class HelpModule { }
