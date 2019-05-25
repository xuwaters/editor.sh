import * as codepad from './codepad.action';
import { EditorUser } from './codepad.model';
import * as immutable from 'immutable';

export interface EditorStateParams {
  language?: string;
  users?: immutable.List<EditorUser>;
  sid?: number;
}

const initialEditorStateParams: EditorStateParams = {
  language: null,
  users: null,
  sid: 0,
};

export class EditorState extends immutable.Record(initialEditorStateParams) {
  readonly language: string;
  readonly users: immutable.List<EditorUser>;
  readonly sid: number;

  constructor(params?: EditorStateParams) { params ? super(params) : super(); }
  with(params: EditorStateParams): EditorState { return this.merge(params) as this; }
}

const initialEditorState = new EditorState();

export function editorStateReducer(state: EditorState = initialEditorState, action: codepad.CodepadAction): EditorState {
  switch (action.type) {
    case codepad.CodepadActionTypes.LanguageChanged: {
      let msg = action as codepad.CodepadActionLanguageChanged;
      return state.with({
        language: msg.payload.language,
      });
    }
    default: {
      return state;
    }
  }
}
