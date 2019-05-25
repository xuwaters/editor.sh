import { ActionReducerMap } from '@ngrx/store';
import { DatabasesState, databasesStateReducer } from '../stores/databases/databases.reducer';
import { PadsState, padsStateReducer } from '../stores/pads/pads.reducer';
import { QuestionsState, questionsStateReducer } from '../stores/questions/questions.reducer';
import { SettingsState, settingsStateReducer } from '../stores/settings/settings.reducer';
import { DashboardState } from './dashboard.reducer';

// state
export interface DashboardState {
  padsState: PadsState;
  questionsState: QuestionsState;
  databasesState: DatabasesState;
  settingsState: SettingsState;
}

// reducer
export const dashboardReducer: ActionReducerMap<DashboardState> = {
  padsState: padsStateReducer,
  questionsState: questionsStateReducer,
  databasesState: databasesStateReducer,
  settingsState: settingsStateReducer,
};
