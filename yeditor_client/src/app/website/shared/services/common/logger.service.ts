import { Injectable } from '@angular/core';

@Injectable()
export class LoggerService {

  constructor() { }

  log(message?: any, ...optionalParams: any[]) {
    console.log(message, ...optionalParams);
  }
}
