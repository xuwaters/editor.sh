import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MonacoEditorComponent } from 'app/website/shared-ui/monaco-editor/components/monaco-editor.component';
import { DragEventData, SplitPaneComponent } from 'app/website/shared-ui/split-pane/components/split-pane.component';
import { XtermComponent } from 'app/website/shared-ui/xterm/components/xterm.component';
import { XTermSocketChannel } from 'app/website/shared-ui/xterm/components/xterm.socket.channel';
import { Language, Languages } from 'app/website/shared/models/languages.model';
import { //
  CodepadClient, CodepadService, ICommandResponseParams, ICursorChangedEvent, //
  ICursorPosition, IEditorChangedEvent, IEditorSyncParams, ITextChange, ITextRange
} from 'app/website/shared/services/codepad/codepad.service';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import * as codepad from 'app/website/store/codepad';
import { ClientState, ConnectStatus } from 'app/website/store/codepad/store/codepad.reducer.state-client';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import { Subscription } from 'rxjs/Subscription';
import { CodepadEditorHeaderComponent } from '../../components/codepad-editor-header/codepad-editor-header.component';

@Component({
  selector: 'app-codepad-edit',
  templateUrl: './codepad-edit.component.html',
  styleUrls: ['./codepad-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodepadEditComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private logger: LoggerService,
    private codepadService: CodepadService,
    private store$: Store<WebsiteState>,
  ) { }

  private subscriptions: Subscription[] = [];

  editorOptions: monaco.editor.IEditorConstructionOptions = {
    theme: 'vs-dark',
    lineNumbers: 'on',
    language: 'typescript',
    wordWrap: 'off',
    minimap: { enabled: true, renderCharacters: false },
    scrollBeyondLastLine: false,
  };

  @ViewChild('rootPane') rootPane: SplitPaneComponent;
  @ViewChild('editorHeader') editorHeader: CodepadEditorHeaderComponent;
  @ViewChild('editor') editor: MonacoEditorComponent;
  @ViewChild('xterm') xterm: XtermComponent;

  codepadClientState = this.store$.select(codepad.selectCodepadClientState);
  codepadLanguageState = this.store$.select(codepad.selectCodepadEditorStateLanguage);

  private isRemoteEdits: boolean;
  private editorMounted = false;
  private terminalMounted = false;
  private roomKey: string;

  // TODO: move peer state to store
  private peerCursors = new PeerCursors(); // peer_id => decorations

  ngOnInit() {
    const routeUrl = this.activatedRoute.snapshot.parent.url[0];
    this.roomKey = routeUrl.path;
    this.logger.log('editor room url = ', routeUrl.path);
  }

  ngOnDestroy() {
    this.logger.log('editor destroyed.');
    this.subscriptions.forEach(it => it && it.unsubscribe());
    this.subscriptions = [];
  }

  doLayout(event: DragEventData) {
    this.editor.layout();
    this.xterm.layout();
  }

  onSplitGutterReset(event: Event) {
    this.rootPane.resetAreaSizes();
    this.doLayout(null);
  }

  onEditorDidMount() {
    this.editorMounted = true;
    this.onDidMount();
  }

  onTerminalDidMount() {
    this.terminalMounted = true;
    this.onDidMount();
  }

  onDidMount() {
    if (!this.editorMounted) {
      return;
    }
    if (!this.terminalMounted) {
      return;
    }

    this.subscriptions.push(
      this.codepadClientState.subscribe((clientState) => this.onClientStateChanged(clientState))
    );
    this.subscriptions.push(
      this.codepadLanguageState.subscribe((language) => this.onLanguageChanged(language))
    );

    this.editor.codeEditor.getModel().updateOptions({ tabSize: 2 });
    this.editor.registerOnChange((e) => this.onEditorChanged(e));
    this.editor.codeEditor.onDidChangeCursorPosition((e) => this.onCursorPositionChanged(e));
    this.isRemoteEdits = false;

    this.connectCodepadService();
  }

  private onClientStateChanged(clientState: ClientState) {
    this.logger.log('client state changed:', JSON.stringify(clientState));
    if (clientState.connectStatus === ConnectStatus.connected) {
      const client = this.codepadService.currentClient;
      const channel = new XTermSocketChannel(client);
      this.xterm.attachSocketChannel(channel);
    }
  }

  private onLanguageChanged(languageId: string) {
    this.logger.log('language changed:', languageId);
    let language = Languages.getLanguageById(languageId);
    if (language) {
      this.editor.changeLanguage(language.editorLanguage);
      this.editorHeader.changeLanguage(language);
    } else {
      this.logger.log('unsupported language:', languageId);
    }
  }

  onLanguageChangeClicked(language: Language) {
    this.logger.log('language change clicked: ', language);
    let client = this.codepadService.currentClient;
    if (client) {
      client.sendCommandSetLang(language.id);
    } else {
      this.logger.log('client not connected');
    }
  }

  private connectCodepadService() {
    this.xterm.writeln('Welcome to Terminal!');

    let onCreated = (client: CodepadClient) => {
      this.subscriptions.push(
        new Subscription(() => this.store$.dispatch(new codepad.CodepadActionDisconnect()))
      );

      let onEdit = (event) => this.onEditorSync(event);
      client.addEventListener('message', onEdit, 'editor', (payload) => payload.c);
      this.subscriptions.push(new Subscription(() => client.removeEventListener('message', onEdit)));

      let onCommand = (event) => this.onCommandSync(event);
      client.addEventListener('message', onCommand, 'command', (payload) => payload.c);
      this.subscriptions.push(new Subscription(() => client.removeEventListener('message', onCommand)));
    };

    this.store$.dispatch(new codepad.CodepadActionConnect({
      padHash: this.roomKey,
      onCreated: onCreated,
    }));
  }

  onReset() {
    this.logger.log('reset button clicked');
    const client = this.codepadService.currentClient;
    if (!client) {
      this.logger.log('reset command: client not connected');
      return;
    }
    client.sendCommandReset();
  }

  onRunCode() {
    this.logger.log('run button clicked');
    const client = this.codepadService.currentClient;
    if (!client) {
      this.logger.log('run code command: client not connected');
      return;
    }

    let code = this.editor.codeEditor.getValue();
    client.sendCommandRunCode(code);
  }

  private onEditorChanged(event: monaco.editor.IModelContentChangedEvent) {
    if (this.isRemoteEdits) {
      return;
    }
    const client = this.codepadService.currentClient;
    if (!client) {
      this.logger.log('editor change: client not connected');
      return;
    }
    // console.log('change event = ', event);
    let changed = <IEditorChangedEvent>{
      version: event.versionId,
      changes: event.changes.map((item) => <ITextChange>{
        text: item.text,
        range: <ITextRange>{
          start_line: item.range.startLineNumber,
          start_column: item.range.startColumn,
          end_line: item.range.endLineNumber,
          end_column: item.range.endColumn,
        }
      })
    };
    let syncParams = <IEditorSyncParams>{
      changed: changed,
    };
    // this.logger.log('[', (this.isRemoteEdits ? 'remote' : 'local'), ']', ' editor change: ', JSON.stringify(changed));
    client.sendEditor(syncParams);
    this.renderAllPeerCursors();
  }

  private onCursorPositionChanged(event: monaco.editor.ICursorPositionChangedEvent) {
    // send to remote
    if (this.isRemoteEdits) {
      return;
    }
    const client = this.codepadService.currentClient;
    if (!client) {
      this.logger.log('editor change: client not connected');
      return;
    }
    // console.log('change event = ', event);
    let cursor = <ICursorChangedEvent>{
      peer_id: 0,
      position: <ICursorPosition>{
        line: event.position.lineNumber,
        column: event.position.column,
      },
      secondary_positions: event.secondaryPositions.map(it => <ICursorPosition>{
        line: it.lineNumber,
        column: it.column,
      })
    };
    let syncParams = <IEditorSyncParams>{
      cursor: cursor,
    };
    // this.logger.log('[', (this.isRemoteEdits ? 'remote' : 'local'), ']', ' editor change: ', JSON.stringify(changed));
    client.sendEditor(syncParams);
  }

  private onCommandSync(event: MessageEvent) {
    let cmdParams = event.data as ICommandResponseParams;
    if (cmdParams.set_lang) {
      let langId = cmdParams.set_lang;
      let language = Languages.getLanguageById(langId);
      if (language) {
        this.store$.dispatch(new codepad.CodepadActionLanguageChanged({ language: langId }));
      }
    }
  }

  private onEditorSync(event: MessageEvent) {
    this.isRemoteEdits = true;
    try {
      // this.logger.log('editor sync = ', JSON.stringify(event.data));
      let syncParams = event.data as IEditorSyncParams;
      if (syncParams.text != null) {
        this.onEditorSyncText(syncParams.text);
      } else if (syncParams.changed != null) {
        this.onEditorSyncEdit(syncParams.changed);
      } else if (syncParams.cursor != null) {
        this.onEditorSyncCursor(syncParams.cursor);
      }
    } finally {
      this.isRemoteEdits = false;
    }
  }

  private onEditorSyncText(text: string) {
    this.editor.codeEditor.setValue(text);
  }

  private onEditorSyncEdit(changedEvent: IEditorChangedEvent) {
    let edits = changedEvent.changes.map((item, idx) => <monaco.editor.IIdentifiedSingleEditOperation>{
      identifier: <monaco.editor.ISingleEditOperationIdentifier>{
        major: changedEvent.version,
        minor: idx,
      },
      text: item.text,
      range: <monaco.IRange>{
        startLineNumber: item.range.start_line,
        startColumn: item.range.start_column,
        endLineNumber: item.range.end_line,
        endColumn: item.range.end_column,
      }
    });
    let currentSelections = this.editor.codeEditor.getSelections();
    this.editor.codeEditor.executeEdits('remote', edits, currentSelections);
    this.renderAllPeerCursors();
  }

  private onEditorSyncCursor(cursorEvent: ICursorChangedEvent) {
    // this.logger.log('cursor position:', cursorEvent);

    let peer = this.peerCursors.getOrCreatePeer(cursorEvent.peer_id);

    peer.positions = [];
    if (cursorEvent.position) {
      peer.positions.push(cursorEvent.position);
    }
    peer.positions.push(...cursorEvent.secondary_positions);

    this.renderPeerCursors(peer);
    // this.logger.log('decorations = ', decorations);
  }

  private renderPeerCursors(peer: IPeerCursor) {
    if (!peer) {
      return;
    }

    let cursorClassName = 'cursor-' + (peer.peer_id % 5);
    let newDecorations = [];
    newDecorations.push(...peer.positions.map(it => {
      let range = new monaco.Range(it.line, it.column, it.line, it.column + 1);
      return { range: range, options: { className: cursorClassName } };
    }));
    let oldDecorations = peer.decorations;
    peer.decorations = this.editor.codeEditor.deltaDecorations(oldDecorations, newDecorations);
  }

  private renderAllPeerCursors() {
    this.peerCursors.data.forEach(peer => {
      this.renderPeerCursors(peer);
    });
  }
}

interface IPeerCursor {
  peer_id: number;
  decorations: string[];
  positions: ICursorPosition[];
}

class PeerCursors {
  data: IPeerCursor[] = [];

  getPeer(peer_id: number): IPeerCursor {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].peer_id === peer_id) {
        return this.data[i];
      }
    }
    return null;
  }

  getOrCreatePeer(peer_id: number): IPeerCursor {
    let peer = this.getPeer(peer_id);
    if (!peer) {
      peer = <IPeerCursor>{
        peer_id: peer_id,
        decorations: [],
        positions: [],
      };
      this.data.push(peer);
    }
    return peer;
  }
}
