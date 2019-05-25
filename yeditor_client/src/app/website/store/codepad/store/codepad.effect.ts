import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { CodepadService } from 'app/website/shared/services/codepad/codepad.service';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';
import { WebsiteState } from '../../website-store.reducer';
import * as codepad from './codepad.action';
import { ConnectStatus } from './codepad.reducer.state-client';
import { selectCodepadClientState } from './codepad.selector';

@Injectable()
export class CodepadEffect {

  constructor(
    private router: Router,
    private actions$: Actions,
    private store$: Store<WebsiteState>,
    private logger: LoggerService,
    private codepadService: CodepadService,
  ) {
    this.logger.log('codepad effect constructor');
  }

  @Effect({ dispatch: false })
  connectAction$: Observable<Action> = this.actions$.pipe(
    ofType(codepad.CodepadActionTypes.Connect),
    tap((it: codepad.CodepadActionConnect) => {
      this.store$.select(selectCodepadClientState).take(1).subscribe((clientState) => {
        this.logger.log('connect action: clientstate =', JSON.stringify(clientState));
        if (clientState.connectStatus !== ConnectStatus.connecting) {
          this.logger.log('invalid connect status:', clientState.connectStatus);
          return;
        }
        let client = this.codepadService.createClient(it.payload.padHash);
        // listening to open, close, error events
        let onOpen = () => {
          this.store$.dispatch(new codepad.CodepadActionConnectSuccess());
          // remove open and error (keep listening 'close')
          client.removeEventListener('open', onOpen);
          client.removeEventListener('error', onError);
        };
        let onClose = () => {
          this.store$.dispatch(new codepad.CodepadActionClosed());
          // remove all
          client.removeEventListener('open', onOpen);
          client.removeEventListener('error', onError);
          client.removeEventListener('close', onClose);
        };
        let onError = () => {
          this.store$.dispatch(new codepad.CodepadActionConnectFailure());
          // remove all
          client.removeEventListener('open', onOpen);
          client.removeEventListener('error', onError);
          client.removeEventListener('close', onClose);
        };
        // listen events
        client.addEventListener('open', onOpen);
        client.addEventListener('error', onError);
        client.addEventListener('close', onClose);
        // on created callback
        if (it.payload.onCreated) {
          it.payload.onCreated(client);
        }
      });
    })
  );

  @Effect({ dispatch: false })
  disconnectAction$: Observable<Action> = this.actions$.pipe(
    ofType(codepad.CodepadActionTypes.Disconnect),
    tap((it: codepad.CodepadActionDisconnect) => {
      this.logger.log('disconnect action received');
      this.store$.select(selectCodepadClientState).take(1).subscribe((clientState) => {
        // subscription.unsubscribe();
        this.logger.log('disconnect action, clientState =', clientState);
        if (clientState.connectStatus !== ConnectStatus.disconnecting) {
          this.logger.log('invalid disconnect status:', clientState.connectStatus);
          return;
        }
        let client = this.codepadService.currentClient;
        client.close();
      });
    })
  );

}
