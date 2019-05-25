import { QuestionsState } from './questions.reducer';

import { createSelector } from '@ngrx/store';
import { selectDashboardState } from '../../reducers/dashboard.selector';
import { DashboardState } from '../../reducers/dashboard.reducer';

export const selectDashboardQuestionsState = createSelector(
  selectDashboardState,
  (state: DashboardState) => state.questionsState
);

export const selectDashboardQuestionsStateAllQuestions = createSelector(
  selectDashboardQuestionsState,
  (state: QuestionsState) => state.questions,
);

export const selectDashboardQuestionsStateEditingQuestion = createSelector(
  selectDashboardQuestionsState,
  (state: QuestionsState) => state.editingQuestion,
);

export const selectDashboardQuestionsStateSelectedQuestionId = createSelector(
  selectDashboardQuestionsState,
  (state: QuestionsState) => state.selectedQuestionId,
);

export const selectDashboardQuestionsStateSelectedQuestion = createSelector(
  selectDashboardQuestionsState,
  (state: QuestionsState) => state.questions.get(state.selectedQuestionId)
);

export const selectDashboardQuestionsStateFavoriteQuestions = createSelector(
  selectDashboardQuestionsState,
  (state: QuestionsState) => {
    return state.questions.filter(it => it.favorite).toList().sort((a, b) => a.id - b.id);
  }
);

export const selectDashboardQuestionsStateNormalQuestions = createSelector(
  selectDashboardQuestionsState,
  (state: QuestionsState) => {
    return state.questions.filter(it => !it.favorite).toList().sort((a, b) => a.id - b.id);
  }
);
