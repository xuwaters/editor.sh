import * as immutable from 'immutable';
import { Language } from 'app/website/shared/models/languages.model';

export interface QuestionParams {
  id?: number;
  language?: Language;
  author?: string;
  title?: string;
  notes?: string;
  content?: string;
  createTime?: Date;
  favorite?: boolean;
}

const initialQuestionParams: QuestionParams = {
  id: 0,
  language: null,
  author: '',
  title: '',
  notes: '',
  content: '',
  createTime: null,
  favorite: false,
};

export class Question extends immutable.Record(initialQuestionParams) {
  readonly id: number;
  readonly language: Language;
  readonly author: string;
  readonly title: string;
  readonly notes: string;
  readonly content: string;
  readonly createTime: Date;
  readonly favorite: boolean;

  constructor(params?: QuestionParams) { params ? super(params) : super(); }
  with(params: QuestionParams): Question { return this.merge(params) as this; }
}
