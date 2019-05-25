import { Injectable } from '@angular/core';
import { gzip, ungzip } from 'pako';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class CodepadService {

  constructor(
    private logger: LoggerService,
  ) {
  }

  private _currentClient: CodepadClient;
  get currentClient(): CodepadClient { return this._currentClient; }

  private makeEndPointUrl(uri: string): string {
    let protocol = location.protocol.match(/^https/) ? 'wss' : 'ws';
    if (uri.charAt(0) !== '/') {
      return uri;
    }
    if (uri.charAt(1) === '/') {
      return `${protocol}:${uri}`;
    }
    return `${protocol}://${location.host}${uri}`;
  }

  createClient(roomKey: string): CodepadClient {
    if (this.currentClient) {
      if (this.currentClient.roomKey === roomKey) {
        return this.currentClient;
      } else {
        throw new Error('should close current client first');
      }
    }

    let endpointUrl = this.makeEndPointUrl('/realtime/' + roomKey);
    this._currentClient = new CodepadClient(roomKey, endpointUrl);

    let onClientClosed = () => {
      this.logger.log('current client closed:', this._currentClient.roomKey);
      this._currentClient.removeEventListener('close', onClientClosed);
      this._currentClient = null;
    };

    this._currentClient.addEventListener('close', onClientClosed);

    return this.currentClient;
  }

}

type MessageEventListener = (event: MessageEvent) => void;
type PayloadConverter = (payload: any) => any;

export class CodepadClient {

  static readonly CLOSED: number = WebSocket.CLOSED;
  static readonly CLOSING: number = WebSocket.CLOSING;
  static readonly CONNECTING: number = WebSocket.CONNECTING;
  static readonly OPEN: number = WebSocket.OPEN;

  private socket: WebSocket;

  // 'message' listeners, Array<[listener, translatedListener]>
  private messageListeners: Array<EventListenerOrEventListenerObject[]>;

  constructor(
    readonly roomKey: string,
    readonly endpointUrl: string
  ) {
    this.socket = new WebSocket(endpointUrl);
    this.socket.binaryType = 'arraybuffer';
    this.messageListeners = [];
  }

  get readyState(): number {
    return this.socket.readyState;
  }

  get connected(): boolean {
    return this.readyState === CodepadClient.OPEN;
  }

  close() {
    this.socket.close();
  }

  addEventListener<
    K extends keyof WebSocketEventMap,
    C extends 'terminal' | 'editor' | 'command' | undefined
  >(
    type: K, listener: MessageEventListener, msgCmd?: C, payloadConverter?: PayloadConverter
  ): void {
    if (type === 'message') {
      let msgListener = this.createMessageAdaptor(listener, msgCmd, payloadConverter);
      this.messageListeners.push([listener, msgListener]);
      this.socket.addEventListener(type, msgListener);
    } else {
      this.socket.addEventListener(type, listener);
    }
  }

  removeEventListener<K extends 'close' | 'error' | 'message' | 'open'>(
    type: K, listener: MessageEventListener,
  ): void {
    if (type === 'message') {
      for (let idx = 0; idx < this.messageListeners.length; idx++) {
        let item = this.messageListeners[idx];
        if (item[0] === listener) {
          this.socket.removeEventListener(type, item[1]);
          this.messageListeners.splice(idx, 1);
          break;
        }
      }
    } else {
      this.socket.removeEventListener(type, listener);
    }
  }

  private getMsgTag(msgCmd?: string): string {
    switch (msgCmd) {
      case 'terminal': return 't';
      case 'editor': return 'e';
      case 'command': return 'c';
      default: return undefined;
    }
  }

  private createMessageAdaptor(
    listener: MessageEventListener,
    msgCmd?: string,
    payloadConverter?: PayloadConverter
  ): MessageEventListener {
    let tag = this.getMsgTag(msgCmd);
    return (event: MessageEvent) => {
      let data = event.data;
      if (data instanceof ArrayBuffer) {
        data = ungzip(data, { to: 'string' });
      }
      // console.log('data = ', data);
      let payload = JSON.parse(data);
      if (tag === undefined || payload.t === tag) {
        if (payloadConverter) {
          payload = payloadConverter(payload);
        }
        let msgEvent = new MessageEvent(event.type, {
          data: payload,
          lastEventId: event.lastEventId,
          origin: event.origin,
          ports: event.ports.reduce((acc, curr) => { acc.push(curr); return acc; }, []),
          source: event.source,
        });
        listener(msgEvent);
      }
    };
  }

  // packet = { t: tag, c: content }
  // tag = e (editor), c (command), t (terminal)
  // content = { name: args }
  //   command = [{'reset': []}, {'run_code', code_content}, {'set_lang': 'lang_name'}]
  //   terminal = [{'set_size': [row, col]}, {'stdin': input_string}]
  //   editor = []
  private sendMessage(tag: string, content: any) {
    let packet = { t: tag, c: content };
    let payload = JSON.stringify(packet);
    if (payload.length > 128) {
      payload = gzip(payload);
    }
    this.socket.send(payload);
  }

  sendTerminal(content: any) {
    this.sendMessage('t', content);
  }

  sendCommand(content: ICommandRequestParams) {
    this.sendMessage('c', content);
  }

  sendEditor(content: IEditorSyncParams) {
    this.sendMessage('e', content);
  }

  sendTerminalSetSize(row: number, col: number) {
    this.sendTerminal({ 'set_size': [row, col] });
  }

  sendTerminalStdin(stdin: string) {
    this.sendTerminal({ 'stdin': stdin });
  }

  sendCommandReset() {
    this.sendCommand({ 'reset': [] });
  }

  sendCommandRunCode(code: string) {
    this.sendCommand({ 'run_code': code });
  }

  sendCommandSetLang(lang: string) {
    this.sendCommand({ 'set_lang': lang });
  }
}

export interface IEditorSyncParams {
  changed?: IEditorChangedEvent;
  text?: string;
  cursor?: ICursorChangedEvent;
}
export interface IEditorChangedEvent {
  version: number;
  changes: ITextChange[];
}
export interface ITextChange {
  range: ITextRange;
  text: string;
}
export interface ITextRange {
  start_line: number;
  start_column: number;
  end_line: number;
  end_column: number;
}
// cursor
export interface ICursorChangedEvent {
  peer_id: number;
  position?: ICursorPosition;
  secondary_positions: ICursorPosition[];
}

export interface ICursorPosition {
  line: number;
  column: number;
}

export interface ICommandRequestParams {
  reset?: any;
  run_code?: string;
  set_lang?: string;
}

export interface ICommandResponseParams {
  set_lang?: string;
}
