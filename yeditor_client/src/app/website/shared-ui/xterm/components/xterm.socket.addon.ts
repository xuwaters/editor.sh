/**
 * Copyright (c) 2016 The xterm.js authors. All rights reserved.
 * @license MIT
 *
 * This module provides methods for attaching a terminal to a terminado
 * ISocketChannel stream.
 */

import { Terminal } from 'xterm';

export interface ISocketChannel {
  addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: EventListenerOrEventListenerObject): void;
  removeEventListener<K extends keyof WebSocketEventMap>(type: K, listener: EventListenerOrEventListenerObject): void;
  send(data: string);
}

export interface ITerminadoAddonTerminal extends Terminal {
  __socket?: ISocketChannel;
  __attachSocketBuffer?: string;

  __getMessage?(ev: MessageEvent): void;
  __flushBuffer?(): void;
  __pushToBuffer?(data: string): void;
  __sendData?(data: string): void;
  __setSize?(size: { rows: number, cols: number }): void;
}

/**
 * Attaches the given terminal to the given socket.
 *
 * @param term The terminal to be attached to the given socket.
 * @param socket The socket to attach the current terminal.
 * @param bidirectional Whether the terminal should send data to the socket as well.
 * @param buffered Whether the rendering of incoming data should happen instantly or at a maximum
 * frequency of 1 rendering per 10ms.
 */
export function terminadoAttach(term: Terminal, socket: ISocketChannel, bidirectional: boolean, buffered: boolean): void {
  const addonTerminal = <ITerminadoAddonTerminal>term;
  bidirectional = (typeof bidirectional === 'undefined') ? true : bidirectional;
  addonTerminal.__socket = socket;

  addonTerminal.__flushBuffer = () => {
    addonTerminal.write(addonTerminal.__attachSocketBuffer);
    addonTerminal.__attachSocketBuffer = null;
  };

  addonTerminal.__pushToBuffer = (data: string) => {
    if (addonTerminal.__attachSocketBuffer) {
      addonTerminal.__attachSocketBuffer += data;
    } else {
      addonTerminal.__attachSocketBuffer = data;
      setTimeout(addonTerminal.__flushBuffer, 10);
    }
  };

  addonTerminal.__getMessage = (ev: MessageEvent) => {
    const data = JSON.parse(ev.data);
    if (data[0] === 'stdout') {
      if (buffered) {
        addonTerminal.__pushToBuffer(data[1]);
      } else {
        addonTerminal.write(data[1]);
      }
    }
  };

  addonTerminal.__sendData = (data: string) => {
    socket.send(JSON.stringify(['stdin', data]));
  };

  addonTerminal.__setSize = (size: { rows: number, cols: number }) => {
    // console.log('terminal set_size = ', size.rows, ' x ', size.cols);
    socket.send(JSON.stringify(['set_size', size.rows, size.cols]));
  };

  socket.addEventListener('message', addonTerminal.__getMessage);

  if (bidirectional) {
    addonTerminal.on('data', addonTerminal.__sendData);
  }
  addonTerminal.on('resize', addonTerminal.__setSize);

  socket.addEventListener('close', () => terminadoDetach(addonTerminal, socket));
  socket.addEventListener('error', () => terminadoDetach(addonTerminal, socket));

  // set size on attach
  addonTerminal.__setSize({ rows: addonTerminal.rows, cols: addonTerminal.cols });
}

/**
 * Detaches the given terminal from the given socket
 *
 * @param term The terminal to be detached from the given socket.
 * @param socket The socket from which to detach the current terminal.
 */
export function terminadoDetach(term: Terminal, socket: ISocketChannel): void {
  const addonTerminal = <ITerminadoAddonTerminal>term;
  addonTerminal.off('data', addonTerminal.__sendData);

  socket = (typeof socket === 'undefined') ? addonTerminal.__socket : socket;

  if (socket) {
    socket.removeEventListener('message', addonTerminal.__getMessage);
  }

  delete addonTerminal.__socket;
}

export function apply(terminalConstructor: typeof Terminal): void {
  /**
   * Attaches the current terminal to the given socket
   *
   * @param socket - The socket to attach the current terminal.
   * @param bidirectional - Whether the terminal should send data to the socket as well.
   * @param buffered - Whether the rendering of incoming data should happen instantly or at a
   * maximum frequency of 1 rendering per 10ms.
   */
  (<any>terminalConstructor.prototype).terminadoAttach =
    function (socket: ISocketChannel, bidirectional: boolean, buffered: boolean): void {
      return terminadoAttach(this, socket, bidirectional, buffered);
    };

  /**
   * Detaches the current terminal from the given socket.
   *
   * @param socket The socket from which to detach the current terminal.
   */
  (<any>terminalConstructor.prototype).terminadoDetach =
    function (socket: ISocketChannel): void {
      return terminadoDetach(this, socket);
    };
}
