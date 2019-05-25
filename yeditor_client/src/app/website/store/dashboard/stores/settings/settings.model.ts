import { Language } from 'app/website/shared/models/languages.model';
import * as immutable from 'immutable';

export interface SettingParams {
  id?: number;
  api_key?: string;
  language?: Language;
  pads_private?: boolean;
  email_subscription?: boolean;
  code_execution?: boolean;
  email?: string;
  name?: string;
}

const initialSettingParams: SettingParams = {
  id: 0,
  api_key: '',
  language: null,
  pads_private: false,
  email_subscription: false,
  code_execution: false,
  email: '',
  name: '',
};

export class Setting extends immutable.Record(initialSettingParams) {
  readonly id: number;
  readonly api_key: string;
  readonly language: Language;
  readonly pads_private: boolean;
  readonly email_subscription: boolean;
  readonly code_execution: boolean;
  readonly email: string;
  readonly name: string;

  constructor(params?: SettingParams) { params ? super(params) : super(); }
  with(params: SettingParams): Setting { return this.merge(params) as this; }
}
