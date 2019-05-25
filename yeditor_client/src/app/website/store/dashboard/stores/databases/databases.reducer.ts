import { Database } from './databases.model';
import * as actions from './databases.action';
import * as immutable from 'immutable';

export interface DatabasesStateParams {
  databases?: immutable.Map<number, Database>;
}

const initialDatabasesStateParams: DatabasesStateParams = {
  databases: immutable.Map<number, Database>(),
};

export class DatabasesState extends immutable.Record(initialDatabasesStateParams) {
  readonly databases: immutable.Map<number, Database>;

  constructor(params?: DatabasesStateParams) { params ? super(params) : super(); }
  with(values: DatabasesStateParams): DatabasesState { return this.merge(values) as this; }

  addOrUpdateDatabase(question: Database): DatabasesState {
    return this.with({
      databases: this.databases.set(question.id, question),
    });
  }
}

const initialDatabasesState = new DatabasesState();

export function databasesStateReducer(state: DatabasesState = initialDatabasesState, action: actions.DatabasesAction): DatabasesState {
  switch (action.type) {
    case actions.DatabasesActionTypes.QueryAllSuccess: {
      const msg = action as actions.DatabasesActionQueryAllSuccess;
      const databasesList = msg.payload.databases || [];
      const databasesMap = immutable.Map<number, Database>().withMutations(it => {
        databasesList.forEach(item => it.set(item.id, item));
      });
      //
      return state.with({
        databases: databasesMap,
      });
    }

    case actions.DatabasesActionTypes.SaveSuccess: {
      const msg = action as actions.DatabasesActionSaveSuccess;
      const question = msg.payload.database;
      return state.addOrUpdateDatabase(question);
    }

    case actions.DatabasesActionTypes.DeleteSuccess: {
      const msg = action as actions.DatabasesActionDeleteSuccess;
      return state.with({
        databases: state.databases.delete(msg.payload.databaseId)
      });
    }

    default: {
      return state;
    }
  }
}
