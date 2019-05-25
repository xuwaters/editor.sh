
import * as immutable from 'immutable';

export interface EditorUserParams {
  sid?: number;
  name?: string;
  admin?: boolean;
}

const initialEditorUserParams: EditorUserParams = {
  sid: 0,
  name: '',
  admin: false,
};

export class EditorUser extends immutable.Record(initialEditorUserParams) {
  readonly sid: number;
  readonly name: string;
  readonly admin: boolean;

  constructor(params?: EditorUserParams) { params ? super(params) : super(); }
  with(params: EditorUserParams): EditorUser { return this.merge(params) as this; }
}

export interface CodepadInitParams {
  language?: string; // language id
  code?: string; // code content
  users?: immutable.List<EditorUser>; // room users
  sid?: number; // self session id
}

const initialCodepadInitParams: CodepadInitParams = {
  language: '',
  code: '',
  users: immutable.List<EditorUser>(),
  sid: 0,
};

export class CodepadInit extends immutable.Record(initialCodepadInitParams) {
  readonly language: string;
  readonly code: string;
  readonly users: immutable.List<EditorUser>;
  readonly sid: number;

  constructor(params?: CodepadInitParams) { params ? super(params) : super(); }
  with(params: CodepadInitParams): CodepadInit { return this.merge(params) as this; }
}
