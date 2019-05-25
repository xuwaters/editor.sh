import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { CommonActionConfirmDialog } from 'app/website/store/common';
import { ConfirmDataParams } from 'app/website/store/common/store/common.model';
import * as questions from 'app/website/store/dashboard/stores/questions/index';
import { WebsiteState } from 'app/website/store/website-store.reducer';


@Component({
  selector: 'app-questions-edit',
  templateUrl: './questions-edit.component.html',
  styleUrls: ['./questions-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionsEditComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store$: Store<WebsiteState>,
    private logger: LoggerService,
  ) { }

  question$ = this.store$.select(questions.selectDashboardQuestionsStateEditingQuestion);

  ngOnInit() {
    const paramMap = this.activatedRoute.snapshot.paramMap;
    const questionId = parseInt(paramMap.get('question_id'), 10);
    if (isNaN(questionId)) {
      this.logger.log('edit question id = ', questionId);
      this.router.navigate(['/dashboard/questions']);
      return;
    }

    this.store$.dispatch(new questions.QuestionsActionQueryEditing({ questionId: questionId }));
  }

  onSave(currQuestion: questions.Question) {
    this.store$.dispatch(new questions.QuestionsActionSave({ question: currQuestion }));
  }

  onDelete(currQuestion: questions.Question) {
    const confirmData: ConfirmDataParams = {
      okButton: 'Delete',
      okColor: 'warn',
      payload: currQuestion,
      afterClose: (result) => {
        if (result) {
          this.store$.dispatch(new questions.QuestionsActionDelete({ question: result }));
        }
      }
    };
    this.store$.dispatch(new CommonActionConfirmDialog(confirmData));
  }

}
