import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { //
  Question, QuestionsActionQueryAll, QuestionsActionUpdateFavorite, //
  selectDashboardQuestionsStateFavoriteQuestions, //
  selectDashboardQuestionsStateNormalQuestions, //
  selectDashboardQuestionsStateSelectedQuestionId
} from 'app/website/store/dashboard/stores/questions/index';
import { QuestionsActionSelected } from 'app/website/store/dashboard/stores/questions/questions.action';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import * as immutable from 'immutable';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-questions-sidebar',
  templateUrl: './questions-sidebar.component.html',
  styleUrls: ['./questions-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionsSidebarComponent implements OnInit {
  constructor(
    private store$: Store<WebsiteState>,
  ) { }

  favoriteQuestions$: Observable<immutable.List<Question>> = this.store$.select(selectDashboardQuestionsStateFavoriteQuestions);
  normalQuestions$: Observable<immutable.List<Question>> = this.store$.select(selectDashboardQuestionsStateNormalQuestions);
  hasFavorites$: Observable<boolean> = this.favoriteQuestions$.map(it => it && it.size > 0);
  selectedQuestionId$: Observable<number> = this.store$.select(selectDashboardQuestionsStateSelectedQuestionId);

  ngOnInit() {
    this.store$.dispatch(new QuestionsActionQueryAll());
  }

  onClickStar(item: Question, event: Event) {
    event.stopPropagation();
    this.store$.dispatch(new QuestionsActionUpdateFavorite({ question: item, favorite: !item.favorite }));
  }

  onSelectQuestion(item: Question) {
    this.store$.dispatch(new QuestionsActionSelected({ selectedQuestionId: item.id }));
  }

  onClearSelect() {
    this.store$.dispatch(new QuestionsActionSelected({ selectedQuestionId: 0 }));
  }
}
