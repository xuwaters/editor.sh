import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class CommonService {

  constructor() { }

  getLocalStorageItem(key: string): any {
    return LocalStorage.inst.getItem(key);
  }

  setLocalStorageItem(key: string, value: any) {
    LocalStorage.inst.setItem(key, value);
  }

  toHttpParams(params: object): HttpParams {
    return HttpParamsConverter.toHttpParams(params);
  }
}

class HttpParamsConverter {

  static toHttpParams(params: object): HttpParams {
    let result: { [key: string]: string } = {};
    this.dfs([], result, params, new WeakSet<object>());
    return new HttpParams({ fromObject: result });
  }

  private static pathNameReducer = (acc, curr, idx) => (idx === 0 ? acc + curr : acc + `[${curr}]`);

  private static dfs(path: string[], result: { [k: string]: string }, current: any, cache: WeakSet<object>) {
    if (current == null) {
      return;
    }
    const t = typeof (current);
    if (t === 'object') {
      if (cache.has(current)) {
        const key = path.reduce(this.pathNameReducer, '');
        throw new Error(`cyclic reference detected: ${key}`);
      }
      cache.add(current);
      for (let name in current) {
        if (current.hasOwnProperty(name)) {
          path.push(name);
          this.dfs(path, result, current[name], cache);
          path.pop();
        }
      }
    } else if (t === 'number') {
      const key = path.reduce(this.pathNameReducer, '');
      result[key] = '' + current;
    } else if (t === 'string') {
      const key = path.reduce(this.pathNameReducer, '');
      result[key] = current;
    }
  }
}

export class LocalStorage {
  static readonly inst = new LocalStorage();

  private constructor() { }

  private data = {};

  getItem(key: string): any {
    try {
      const value = window.localStorage.getItem(key);
      return JSON.parse(value);
    } catch (e) {
      return this.data[key];
    }
  }

  setItem(key: string, value: any) {
    try {
      const json = JSON.stringify(value);
      window.localStorage.setItem(key, json);
    } catch (e) {
      this.data[key] = value;
    }
  }

  removeItem(key: string) {
    try {
      window.localStorage.removeItem(key);
      delete this.data[key];
    } catch (e) {
      delete this.data[key];
    }
  }
}
