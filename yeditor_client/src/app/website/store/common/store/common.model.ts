import * as immutable from 'immutable';

// CommonState

export interface CommonStateParams {
  snackBarMessage?: SnackBarMessage;
  apiErrorState?: ApiErrorState;
  confirmData?: ConfirmData;
}

const initialCommonStateParams: CommonStateParams = {
  snackBarMessage: null,
  apiErrorState: null,
  confirmData: null,
};

export class CommonState extends immutable.Record(initialCommonStateParams) {
  readonly snackBarMessage: SnackBarMessage;
  readonly apiErrorState: ApiErrorState;
  readonly confirmData: ConfirmData;

  constructor(params?: CommonStateParams) { params ? super(params) : super(); }
  with(params: CommonStateParams): CommonState { return this.merge(params) as this; }
}

// SnackBarMessage

export interface SnackBarMessageParams {
  message?: string;
  action?: string;
}

const initialSnackBarMessageParams: SnackBarMessageParams = {
  message: '',
  action: '[ OK ]',
};

export class SnackBarMessage extends immutable.Record(initialSnackBarMessageParams) {
  readonly message: string;
  readonly action: string;

  constructor(params?: SnackBarMessageParams) { params ? super(params) : super(); }
  with(params: SnackBarMessageParams): SnackBarMessage { return this.merge(params) as this; }
}

// ApiErrorState

export interface ApiErrorMessage {
  message: string;
  extensions?: { [key: string]: string };
}

export interface ApiErrorStateParams {
  errors?: ApiErrorMessage[];
}

const initialApiErrorStateParams: ApiErrorStateParams = {
  errors: null,
};

export class ApiErrorState extends immutable.Record(initialApiErrorStateParams) {
  readonly errors: ApiErrorMessage[];

  constructor(params?: ApiErrorStateParams) { params ? super(params) : super(); }
  with(params: ApiErrorStateParams): ApiErrorState { return this.merge(params) as this; }
}

// Confirm

export interface ConfirmDataParams {
  title?: string;
  content?: string;
  payload?: any;
  cancelButton?: string;
  okButton?: string;
  okColor?: string;
  afterClose?: (result: any) => void;
}

const initialConfirmDataParams: ConfirmDataParams = {
  title: '',
  content: '',
  payload: true,
  cancelButton: '',
  okButton: '',
  okColor: '',
  afterClose: null,
};

export class ConfirmData extends immutable.Record(initialConfirmDataParams) {
  readonly title: string;
  readonly content: string;
  readonly payload: any;
  readonly cancelButton: string;
  readonly okButton: string;
  readonly okColor: string;
  readonly afterClose: (result: any) => void;

  constructor(params?: ConfirmDataParams) { params ? super(params) : super(); }
  with(params: ConfirmDataParams): ConfirmData { return this.merge(params) as this; }
}
