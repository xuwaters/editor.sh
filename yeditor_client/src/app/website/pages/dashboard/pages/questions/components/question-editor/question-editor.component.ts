import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { LanguageSelectorComponent } from 'app/website/shared-ui/language-selector/components/language-selector.component';
import { MonacoEditorComponent } from 'app/website/shared-ui/monaco-editor/components/monaco-editor.component';
import { Language } from 'app/website/shared/models/languages.model';
import { Question, QuestionParams } from 'app/website/store/dashboard/stores/questions/index';
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-question-editor',
  templateUrl: './question-editor.component.html',
  styleUrls: ['./question-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionEditorComponent implements OnInit, OnDestroy {
  constructor() { }

  private subscriptions: Subscription[] = [];

  private questionChanged = new EventEmitter<QuestionParams>();

  questionValue: QuestionParams = <QuestionParams>{
    id: 0,
    language: null,
    author: '',
    title: '',
    notes: '',
    content: '',
    createTime: null,
    favorite: false,
  };

  @ViewChild(LanguageSelectorComponent) languageSelector: LanguageSelectorComponent;

  @Output() questionSave = new EventEmitter<Question>();
  @Output() questionDelete = new EventEmitter<Question>();

  @Input() enableDeleteButton = true;

  get question(): Question { return new Question(this.questionValue); }
  @Input() set question(value: Question) {
    if (value != null) {
      this.questionValue = value.toObject();
      this.questionChanged.next(value);
    }
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
    language: 'typescript',
    wordWrap: 'off',
    minimap: { enabled: true, renderCharacters: false },
    scrollBeyondLastLine: false,
    theme: 'vs',
  };
  contentCodeEditor: monaco.editor.IStandaloneCodeEditor;

  ngOnInit() {
    if (this.question) {
      this.onQuestionChanged(this.question);
    }
    this.subscriptions.push(this.questionChanged.subscribe(it => this.onQuestionChanged(it)));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(it => it.unsubscribe());
    this.subscriptions = [];
  }

  onQuestionChanged(question: QuestionParams) {
    this.languageSelector.selectedLanguage = question.language;
  }

  onLanguageChanged(language: any) {
    if (language instanceof Language) {
      this.questionValue.language = language;
      this.contentEditorOptions.language = language.editorLanguage;
      this.contentEditor.options = this.contentEditorOptions;
    }
  }

  onDescriptionEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.getModel().updateOptions({ tabSize: 2 });
  }

  onContentEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.getModel().updateOptions({ tabSize: 2 });
    this.contentCodeEditor = editor;
  }

  onSave() {
    this.questionSave.next(this.question);
  }

  onDelete() {
    this.questionDelete.next(this.question);
  }

}
