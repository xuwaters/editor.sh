import { Injectable } from '@angular/core';

@Injectable()
export class JwtService {

  public static readonly TOKEN_KEY = 'yeditor.token';

  private localToken = '';

  getToken(): string {
    try {
      return window.localStorage[JwtService.TOKEN_KEY] || '';
    } catch (e) {
      return this.localToken;
    }
  }

  saveToken(token: string) {
    try {
      this.localToken = token;
      window.localStorage[JwtService.TOKEN_KEY] = token;
    } catch (e) {
    }
  }

  destroyToken() {
    try {
      this.localToken = '';
      window.localStorage.removeItem(JwtService.TOKEN_KEY);
    } catch (e) {
    }
  }

}
