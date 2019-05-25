import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CodepadState } from './codepad.reducer';
import { ClientState } from './codepad.reducer.state-client';
import { EditorState } from './codepad.reducer.state-editor';

export const selectCodepadState = createFeatureSelector<CodepadState>('codepad');

export const selectCodepadClientState = createSelector(
  selectCodepadState,
  (state: CodepadState) => state.clientState
);

export const selectCodepadClientStateConnectStatus = createSelector(
  selectCodepadClientState,
  (state: ClientState) => state.connectStatus
);

export const selectCodepadEditorState = createSelector(
  selectCodepadState,
  (state: CodepadState) => state.editorState
);

export const selectCodepadEditorStateLanguage = createSelector(
  selectCodepadEditorState,
  (state: EditorState) => state.language
);
