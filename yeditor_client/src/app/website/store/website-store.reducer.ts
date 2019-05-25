import { Action, ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from 'environments/environment';


export interface WebsiteState {
}

export const websiteReducers: ActionReducerMap<WebsiteState> = {
};

export function logger(reducer: ActionReducer<WebsiteState>): ActionReducer<WebsiteState> {
  return (state: WebsiteState, action: Action): WebsiteState => {
    if (console && console.log) {
      // console.log('action = ', action, ', state = ', state);
    }
    return reducer(state, action);
  };
}

export const websiteMetaReducers: MetaReducer<WebsiteState>[] = environment.production ? [] : [
  logger,
];
