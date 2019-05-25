import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {
  readonly supportEmail = 'support@editor.sh';
  readonly websiteUrl = 'https://editor.sh';
  readonly websiteName = 'YEditor';
  readonly websiteShortHost = 'editor.sh';
  readonly websiteCopyRight = '2019 YEditor';
}
