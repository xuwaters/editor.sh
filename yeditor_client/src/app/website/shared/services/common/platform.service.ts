
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Injectable()
export class PlatformService {
  constructor(
    @Inject(PLATFORM_ID) private platformId,
  ) { }

  public get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  public get isServer(): boolean {
    return isPlatformServer(this.platformId);
  }
}
