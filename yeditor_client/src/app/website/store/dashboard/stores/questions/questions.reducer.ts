import { Question } from './questions.model';
import * as actions from './questions.action';
import * as immutable from 'immutable';

export interface QuestionsStateParams {
  questions?: immutable.Map<number, Question>;
  selectedQuestionId?: number;
  editingQuestion?: Question;
}

const initialQuestionsStateParams: QuestionsStateParams = {
  questions: immutable.Map<number, Question>(),
  selectedQuestionId: 0,
  editingQuestion: null,
};

export class QuestionsState extends immutable.Record(initialQuestionsStateParams) {
  readonly questions: immutable.Map<number, Question>;
  readonly selectedQuestionId: number;
  readonly editingQuestion: Question;

  constructor(params?: QuestionsStateParams) { params ? super(params) : super(); }
  with(values: QuestionsStateParams): QuestionsState { return this.merge(values) as this; }

  addOrUpdateQuestion(question: Question): QuestionsState {
    return this.with({
      questions: this.questions.set(question.id, question),
    });
  }
}

const initialQuestionsState = new QuestionsState();

export function questionsStateReducer(state: QuestionsState = initialQuestionsState, action: actions.QuestionsAction): QuestionsState {
  switch (action.type) {
    case actions.QuestionsActionTypes.QueryAllSuccess: {
      const msg = action as actions.QuestionsActionQueryAllSuccess;
      const questionsList = msg.payload.questions || [];
      const questionsMap = immutable.Map<number, Question>().withMutations(it => {
        questionsList.forEach(item => it.set(item.id, item));
      });
      //
      return state.with({
        questions: questionsMap,
      });
    }

    case actions.QuestionsActionTypes.UpdateFavoriteSuccess: {
      const msg = action as actions.QuestionsActionUpdateFavoriteSuccess;
      let question = state.questions.get(msg.payload.questionId);
      question = question.with({ favorite: msg.payload.favorite });
      return state.addOrUpdateQuestion(question);
    }

    case actions.QuestionsActionTypes.SaveSuccess: {
      const msg = action as actions.QuestionsActionSaveSuccess;
      const question = msg.payload.question;
      return state.addOrUpdateQuestion(question);
    }

    case actions.QuestionsActionTypes.DeleteSuccess: {
      const msg = action as actions.QuestionsActionDeleteSuccess;
      return state.with({
        questions: state.questions.delete(msg.payload.questionId)
      });
    }

    case actions.QuestionsActionTypes.Selected: {
      const msg = action as actions.QuestionsActionSelected;
      return state.with({ selectedQuestionId: msg.payload.selectedQuestionId });
    }

    case actions.QuestionsActionTypes.QueryEditingSuccess: {
      const msg = action as actions.QuestionsActionQueryEditingSuccess;
      return state.with({ editingQuestion: msg.payload.question });
    }

    case actions.QuestionsActionTypes.QueryEditingClear: {
      return state.with({ editingQuestion: null });
    }

    default: {
      return state;
    }
  }
}
