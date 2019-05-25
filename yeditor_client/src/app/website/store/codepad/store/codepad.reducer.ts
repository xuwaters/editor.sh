import { ActionReducerMap } from '@ngrx/store';
import { ClientState, clientStateReducer } from '../store/codepad.reducer.state-client';
import { EditorState, editorStateReducer } from '../store/codepad.reducer.state-editor';

// state
export interface CodepadState {
  clientState: ClientState;
  editorState: EditorState;
}

// reducer
export const codepadStateReducer: ActionReducerMap<CodepadState> = {
  clientState: clientStateReducer,
  editorState: editorStateReducer,
};
