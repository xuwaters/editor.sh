import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as questions from 'app/website/store/dashboard/stores/questions/index';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import { QuestionPreviewComponent } from '../../components/question-preview/question-preview.component';
import { QuestionsSidebarComponent } from '../../components/questions-sidebar/questions-sidebar.component';


@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionsListComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store$: Store<WebsiteState>,
  ) { }

  @ViewChild(QuestionsSidebarComponent) sidebar: QuestionsSidebarComponent;
  @ViewChild(QuestionPreviewComponent) preview: QuestionPreviewComponent;

  ngOnInit() {
    const paramMap = this.activatedRoute.snapshot.paramMap;
    const questionId = parseInt(paramMap.get('question_id'), 10);
    const selectedQuestionId = (isNaN(questionId) ? 0 : questionId);
    this.store$.dispatch(new questions.QuestionsActionSelected({ selectedQuestionId: selectedQuestionId }));
    if (selectedQuestionId === 0) {
      this.router.navigate(['/dashboard/questions']);
    }
  }

  onQuitPreview() {
    this.sidebar.onClearSelect();
  }

  onCreateNewQuestion() {
    this.router.navigate(['/dashboard/questions/create']);
  }
}
