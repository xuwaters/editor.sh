import { ISocketChannel } from './xterm.socket.addon';
import { CodepadClient } from 'app/website/shared/services/codepad/codepad.service';

type MessageEventListener = (event: MessageEvent) => void;

export class XTermSocketChannel implements ISocketChannel {

  constructor(
    public client: CodepadClient
  ) {
  }

  addEventListener<K extends keyof WebSocketEventMap>(
    type: K, listener: MessageEventListener
  ): void {
    this.client.addEventListener(type, listener, 'terminal', (payload) => {
      return this.convert_to_xterm(payload.c);
    });
  }

  removeEventListener<K extends 'close' | 'error' | 'message' | 'open'>(
    type: K, listener: MessageEventListener
  ): void {
    this.client.removeEventListener(type, listener);
  }

  private convert_from_xterm(data: string): any {
    let obj = JSON.parse(data);
    if (obj[0] === 'stdin') {
      return {
        'stdin': obj[1],
      };
    } else if (obj[0] === 'set_size') {
      return {
        'set_size': [obj[1], obj[2]]
      };
    } else {
      throw Error('unsupported xterm protocol: ' + data);
    }
  }

  send(data: string) {
    let content = this.convert_from_xterm(data);
    this.client.sendTerminal(content);
  }

  private convert_to_xterm(content: any): string {
    if (content.stdout !== undefined && content.stdout !== null) {
      return JSON.stringify(['stdout', content.stdout]);
    } else if (content.stderr !== undefined && content.stdout !== null) {
      return JSON.stringify(['stderr', content.stderr]);
    } else {
      return JSON.stringify(['stdout', '']);
    }
  }
}
