import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import * as questions from 'app/website/store/dashboard/stores/questions/index';
import { WebsiteState } from 'app/website/store/website-store.reducer';


@Component({
  selector: 'app-questions-create',
  templateUrl: './questions-create.component.html',
  styleUrls: ['./questions-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionsCreateComponent implements OnInit {
  constructor(
    private store$: Store<WebsiteState>,
    private logger: LoggerService,
  ) { }

  @Input() question: questions.Question;

  ngOnInit() {
    this.question = new questions.Question();
  }

  onSave(currQuestion: questions.Question) {
    // this.logger.log('create question: ', currQuestion);
    this.store$.dispatch(new questions.QuestionsActionSave({ question: currQuestion }));
  }

}
