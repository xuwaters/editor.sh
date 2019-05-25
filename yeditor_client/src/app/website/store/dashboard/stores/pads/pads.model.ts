import * as immutable from 'immutable';

export interface PadsFilters {
  search?: string | null;
  status?: string | null;
  days?: string | null;
}

export enum PadStatus {
  unused = 'unused',
  progressing = 'progressing',
  ended = 'ended',
}

export const PadStatusList = [
  { value: PadStatus.unused, name: 'Unused' },
  { value: PadStatus.progressing, name: 'In progress' },
  { value: PadStatus.ended, name: 'Ended' },
];

export interface PadParams {
  id?: number;
  hash?: string; // pad hash
  title?: string;
  status?: PadStatus;
  creator?: string;
  language?: string;
  createTime?: Date;
  updateTime?: Date;
}

const initialPadParams: PadParams = {
  id: 0,
  hash: '',
  title: '',
  status: PadStatus.unused,
  creator: '',
  language: '',
  createTime: null,
  updateTime: null,
};

export class Pad extends immutable.Record(initialPadParams) {
  readonly id: number;
  readonly hash: string; // room id
  readonly title: string;
  readonly status: PadStatus;
  readonly creator: string;
  readonly language: string;
  readonly createTime: Date;
  readonly updateTime: Date;

  constructor(params?: PadParams) { params ? super(params) : super(); }
  with(params: PadParams): Pad { return this.merge(params) as this; }
}
