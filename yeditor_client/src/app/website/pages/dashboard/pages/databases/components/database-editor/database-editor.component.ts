import { //
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { MatSelectChange } from '@angular/material';
import { MonacoEditorComponent } from 'app/website/shared-ui/monaco-editor/components/monaco-editor.component';
import { DatabaseEngine, DatabaseEngineList, DatabaseEngines } from 'app/website/shared/models/database-engines.model';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import * as databases from 'app/website/store/dashboard/stores/databases/index';
import { Subscription } from 'rxjs/Subscription';



@Component({
  selector: 'app-database-editor',
  templateUrl: './database-editor.component.html',
  styleUrls: ['./database-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatabaseEditorComponent implements OnInit, OnDestroy {
  constructor(
    private logger: LoggerService,
  ) { }

  databaseEngines = DatabaseEngineList;

  private subscriptions: Subscription[] = [];

  databaseValue: databases.DatabaseParams = <databases.DatabaseParams>{
    id: 0,
    title: '',
    status: databases.DatabaseStatus.NonVerified,
    engine: DatabaseEngines.mysql,
    description: '',
    script: '',
  };

  private databaseChanged = new EventEmitter<databases.DatabaseParams>();

  @Output() databaseSave = new EventEmitter<databases.Database>();

  get database(): databases.Database { return new databases.Database(this.databaseValue); }
  @Input() set database(value: databases.Database) {
    this.databaseValue = value.toObject();
    this.databaseChanged.next(value);
  }

  @ViewChild('descriptionEditor') descriptionEditor: MonacoEditorComponent;
  descriptionEditorStyle = { height: '200px' };
  descriptionEditorOptions: monaco.editor.IEditorConstructionOptions = {
    lineNumbers: 'off',
    language: 'markdown',
    wordWrap: 'on',
    minimap: { enabled: false, renderCharacters: false },
    scrollBeyondLastLine: false,
  };

  @ViewChild('contentEditor') contentEditor: MonacoEditorComponent;
  contentEditorStyle = { height: '400px' };
  contentEditorOptions: monaco.editor.IEditorConstructionOptions = {
    lineNumbers: 'on',
    language: 'sql',
    wordWrap: 'off',
    minimap: { enabled: true, renderCharacters: false },
    scrollBeyondLastLine: false,
    theme: 'vs',
  };
  contentCodeEditor: monaco.editor.IStandaloneCodeEditor;

  ngOnInit() {
    if (this.database) {
      this.onDatabaseChanged(this.database);
    }
    this.subscriptions.push(this.databaseChanged.subscribe(it => this.onDatabaseChanged(it)));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(it => it && it.unsubscribe());
    this.subscriptions = [];
  }

  onDatabaseChanged(database: databases.DatabaseParams) {
  }

  onDatabaseEngineChanged(change: MatSelectChange) {
    // this.logger.log('engine changed = ', change);
    const databaseEngine = change.value as DatabaseEngine;
    this.databaseValue.engine = databaseEngine;
  }

  onDescriptionEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.getModel().updateOptions({ tabSize: 2 });
  }

  onContentEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.getModel().updateOptions({ tabSize: 2 });
    this.contentCodeEditor = editor;
  }

  onSave() {
    this.databaseSave.next(this.database);
  }

}
