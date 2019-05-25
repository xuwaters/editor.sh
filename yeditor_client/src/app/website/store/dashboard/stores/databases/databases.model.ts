import { DatabaseEngine } from 'app/website/shared/models/database-engines.model';
import * as immutable from 'immutable';

export enum DatabaseStatus {
  NonVerified = 0,
  Verified = 1,
}

export interface DatabaseParams {
  id?: number;
  title?: string;
  status?: DatabaseStatus;
  engine?: DatabaseEngine;
  description?: string;
  script?: string;
  summary?: string;
}

const initialDatabaseParams: DatabaseParams = {
  id: 0,
  title: '',
  status: null,
  engine: null,
  description: '',
  script: '',
  summary: '',
};

export class Database extends immutable.Record(initialDatabaseParams) {
  readonly id: number;
  readonly title: string;
  readonly status: DatabaseStatus;
  readonly engine: DatabaseEngine;
  readonly description: string;
  readonly script: string;
  readonly summary: string;

  constructor(params?: DatabaseParams) { params ? super(params) : super(); }
  with(params: DatabaseParams): Database { return this.merge(params) as this; }

  get statusText(): string {
    return DatabaseStatus[this.status as number];
  }

  get engineName(): string {
    return this.engine.name;
  }
}
