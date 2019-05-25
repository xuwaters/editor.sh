import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { PlatformService } from 'app/website/shared/services/common/platform.service';
import { fromEvent } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { ITheme, Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as terminado from './xterm.socket.addon';
import { ISocketChannel } from './xterm.socket.addon';

@Component({
  selector: 'app-xterm',
  template: `
    <div class="xterm-terminal" #terminal></div>
  `,
  styles: [`
    :host {
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
    .xterm-terminal {
      height: 100%;
      width: 100%;
      font-size: 1.2rem;
      background-color: #1e1e1e;
    }
    ::ng-deep .terminal {
      font-family: Roboto Mono !important;
    }
    ::ng-deep .xterm-viewport {
      overflow-y: auto !important;
    }
  `],
})
export class XtermComponent implements OnInit, OnDestroy {
  constructor(
    private platformService: PlatformService,
    private logger: LoggerService,
  ) { }

  @ViewChild('terminal') terminalContainer: ElementRef;

  @Output() terminalDidMount = new EventEmitter<any>();

  private terminal: Terminal;

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    if (this.platformService.isBrowser) {
      loadXTermLibrary().then(() => this.initTerminal());
      //
      this.subscriptions.push(
        fromEvent(window, 'resize').subscribe(() => this.layout())
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(it => it && it.unsubscribe());
    this.subscriptions = [];
    //
    if (this.terminal) {
      this.terminal.destroy();
      this.terminal = undefined;
    }
  }

  layout() {
    if (this.terminal) {
      // fit
      fit.fit(this.terminal);
    }
  }

  clear() {
    if (this.terminal) {
      this.terminal.clear();
    }
  }

  attachSocketChannel(socket: ISocketChannel) {
    if (this.terminal) {
      terminado.terminadoAttach(this.terminal, socket, true, false);
      // (<any>this.terminal).terminadoAttach(socket, true, true);
    }
  }

  writeln(line: string) {
    if (this.terminal) {
      this.terminal.writeln(line);
    }
  }

  private initTerminal() {
    //
    // Terminal.applyAddon(fit);
    // Terminal.applyAddon(terminado);
    const containerStyle = window.getComputedStyle(this.terminalContainer.nativeElement);
    //
    this.terminal = new Terminal();
    this.terminal.open(this.terminalContainer.nativeElement);
    this.terminal.setOption('fontSize', parseInt(containerStyle.fontSize, 10));
    this.terminal.setOption('theme', <ITheme>{
      background: containerStyle.backgroundColor
    });
    this.layout();
    //
    this.terminalDidMount.emit(this);
  }
}


// global variables used for xterm library loading
let xtermLoading = false;
let xtermLoadPromise: Promise<void>;

export const loadXTermLibrary = (): Promise<void> => {
  if (xtermLoading) {
    return xtermLoadPromise;
  }
  xtermLoading = true;
  xtermLoadPromise = new Promise<void>((resolve, reject) => {
    const xtermCssId = 'xtermCss';
    if (document.getElementById(xtermCssId)) {
      resolve();
      return;
    }
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');
    link.id = xtermCssId;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = '/assets/xterm/xterm.css';
    link.media = 'all';

    const removeListeners = () => {
      link.removeEventListener('load', onLoadSuccess);
      link.removeEventListener('error', onLoadError);
    };
    const onLoadSuccess = () => {
      removeListeners();
      resolve();
    };
    const onLoadError = () => {
      removeListeners();
      reject();
    };
    //
    link.addEventListener('load', onLoadSuccess);
    link.addEventListener('error', onLoadError);
    //
    head.appendChild(link);
  });
  return xtermLoadPromise;
};
