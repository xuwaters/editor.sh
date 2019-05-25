import { PadParams, PadsFilters } from '../../store/dashboard/stores/pads/pads.model';

// base
export interface RespBase {
  // error?: { [key: string]: string };
}

// auth

export interface ReqUserRegister {
  user: {
    email: string,
    name: string,
    password: string,
  };
  options: {
    email_subscription: boolean,
  };
}

export interface RespUserRegister extends RespBase {
  data: {
    session: {
      token: string,
      // scope: string,
      // expire: number, // utc timestamp
    },
    user: {
      id: number,
      email: string,
      name: string
    }
  };
}

export interface ReqUserLogin {
  user: {
    email: string,
    password: string,
  };
}

export interface RespUserLogin extends RespBase {
  data: {
    session: {
      token: string,
      // scope: string,
      // expire: number, // utc timestamp
    },
    user: {
      id: number,
      email: string,
      name: string
    }
  };
}

export interface ReqOAuthQueryUrl {
  platform: string;
}

export interface RespOAuthQueryUrl {
  data: {
    platform: string;
    authorizeUrl: string;
  };
}

export interface ReqOAuthLogin {
  platform: string;
  code: string;
}

export interface RespOAuthLogin {
  data: {
    session: { token: string },
    user: { id: number, email: string, name: string }
  };
}

export interface ReqUserSessionRefresh {
}

export interface RespUserSessionRefresh extends RespBase {
  data: {
    session: {
      token: string,
      // scope: string,
      // expire: number, // utc timestamp
    },
    user: {
      id: number,
      email: string,
      name: string
    }
  };
}

export interface RespUserLogout extends RespBase {
  data: {
  };
}


// pads

export interface ReqPadsQueryAll {
  query: {
    pageIndex: number,
    pageSize: number,
    filters: PadsFilters,
  };
}

export interface RespPadsQueryAll extends RespBase {
  data: {
    pageIndex: number,
    pageSize: number,
    total: number,
    pads: PadParams[],
  };
}

export interface ReqPadsCreate {
  pad: {
    title?: string,
    language?: string,
  };
}

export interface RespPadsCreate {
  data: PadParams;
}

// questions

export interface ReqQuestionsQueryAll {
  query: {
    offset: number,
    limit: number,
    search: string,
  };
}

export interface QuestionItem {
  id: number;
  language: string;
  author: string;
  title: string;
  notes: string;
  content: string;
  createTime: string;
  favorite: boolean;
}

export interface RespQuestionsQueryAll extends RespBase {
  data: {
    offset: number,
    limit: number,
    total: number,
    questions: QuestionItem[]
  };
}

export interface ReqQuestionUpdateFavorite {
  question: {
    id: number,
    favorite: boolean,
  };
}

export interface RespQuestionUpdateFavorite extends RespBase {
  data: {
    question: {
      id: number,
      favorite: boolean,
    }
  };
}

export interface ReqQuestionSave {
  question: QuestionItem;
}

export interface RespQuestionSave extends RespBase {
  data: {
    question: QuestionItem
  };
}

export interface ReqQuestionDelete {
  question: {
    id: number
  };
}

export interface RespQuestionDelete extends RespBase {
  data: {
    questionId: number,
  };
}

export interface ReqQuestionQueryOne {
  question: { id: number };
}
export interface RespQuestionQueryOne extends RespBase {
  data: {
    question: QuestionItem,
  };
}

// Databases

export interface RespDatabasesQueryAll extends RespBase {
  data: {
    databases: {
      id: number,
      title: string,
      status: number, // 0 - NonVerified, 1 - Verified
      engine: string, // mysql, postgresql
      description: string,
      script: string,
      summary: string,
    }[]
  };
}

export interface ReqDatabaseSave {
  database: {
    id?: number,
    title?: string,
    status?: number,
    engine?: string,
    description?: string,
    script?: string,
  };
}

export interface RespDatabaseSave extends RespBase {
  data: {
    database: {
      id: number;
      title: string;
      status: number;
      engine: string;
      description: string;
      script: string;
      summary: string;
    }
  };
}

export interface ReqDatabaseDelete {
  database: {
    id: number
  };
}

export interface RespDatabaseDelete extends RespBase {
  data: {
    databaseId: number,
  };
}

// settings

export interface SettingItem {
  id?: number;
  api_key?: string;
  language?: string;
  pads_private?: boolean;
  email_subscription?: boolean;
  code_execution?: boolean;
  email?: string;
  name?: string;
}

export interface RespSettingQuery extends RespBase {
  data: {
    setting: SettingItem
  };
}

export interface ReqSettingSave {
  setting: SettingItem;
}

export interface RespSettingSave extends RespBase {
  data: {
    setting: SettingItem
  };
}

export interface RespSettingRefreshApiKey extends RespBase {
  data: {
    api_key: string
  };
}
