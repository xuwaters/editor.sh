
export class DatabaseEngine {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {
  }
}

export class DatabaseEngines {
  static readonly mysql = new DatabaseEngine('mysql', 'MySQL');
  static readonly postgresql = new DatabaseEngine('postgresql', 'PostgreSQL');

  static getDatabaseEngineById(id: string) {
    return DatabaseEngineList.find(it => it.id === id);
  }
}

export const DatabaseEngineList: DatabaseEngine[] = [
  DatabaseEngines.mysql,
  DatabaseEngines.postgresql,
];
