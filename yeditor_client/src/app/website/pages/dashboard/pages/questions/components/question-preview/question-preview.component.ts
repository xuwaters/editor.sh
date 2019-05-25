import { //
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, //
  OnDestroy, OnInit, Output, QueryList, ViewChildren
} from '@angular/core';
import { Store } from '@ngrx/store';
import { loadMonacoLibrary, MonacoEditorComponent } from 'app/website/shared-ui/monaco-editor/components/monaco-editor.component';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { PlatformService } from 'app/website/shared/services/common/platform.service';
import { Question } from 'app/website/store/dashboard/stores/questions/index';
import { selectDashboardQuestionsStateSelectedQuestion } from 'app/website/store/dashboard/stores/questions/questions.selector';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import 'rxjs/add/observable/combineLatest';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';



@Component({
  selector: 'app-question-preview',
  templateUrl: './question-preview.component.html',
  styleUrls: ['./question-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionPreviewComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private changeDetector: ChangeDetectorRef,
    private platformService: PlatformService,
    private store$: Store<WebsiteState>,
    private logger: LoggerService,
  ) { }

  @Output() quitPreview = new EventEmitter<any>();
  @Output() newQuestion = new EventEmitter<any>();

  question$: Observable<Question> = this.store$.select(selectDashboardQuestionsStateSelectedQuestion);

  private codeEditor: monaco.editor.IStandaloneCodeEditor;

  @ViewChildren('editor') editorList: QueryList<MonacoEditorComponent>;

  private editor$ = new BehaviorSubject<MonacoEditorComponent>(undefined);
  private latestChanges$: Observable<{ editor: MonacoEditorComponent, question: Question }>;

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    if (this.platformService.isBrowser) {
      loadMonacoLibrary();
    }
  }

  ngAfterViewInit() {
    // this.logger.log('Preview: ngAfterViewInit: editorList = ', this.editorList.last);
    this.latestChanges$ = Observable.combineLatest(this.editor$, this.question$,
      (editor: MonacoEditorComponent, question: Question) => ({ editor: editor, question: question })
    );
    this.subscriptions.push(this.latestChanges$.subscribe(
      (it: { editor: MonacoEditorComponent, question: Question }) => {
        const editor = it.editor;
        const question = it.question;
        // this.logger.log('combine latest: ', editor, question && question.toObject());
        if (editor) {
          editor.options = this.getEditorOptions(question);
          if (question) {
            editor.writeValue(question.content);
          }
          this.changeDetector.markForCheck();
        }
      }
    ));

    // editor
    if (this.editorList.last) {
      this.editor$.next(this.editorList.last);
    }
    this.subscriptions.push(this.editorList.changes.subscribe(
      (it: QueryList<MonacoEditorComponent>) => it && this.editor$.next(it.first)
    ));

  }

  ngOnDestroy() {
    // this.logger.log('Preview: ngDestroy');
    this.subscriptions.forEach(it => it && it.unsubscribe());
    this.subscriptions = [];
  }

  getEditorOptions(question: Question): monaco.editor.IEditorConstructionOptions {
    if (!question) {
      return { readOnly: true };
    }
    return {
      readOnly: true,
      language: question.language.editorLanguage,
      lineNumbers: 'on',
      wordWrap: 'off',
      minimap: { enabled: true, renderCharacters: false },
      scrollBeyondLastLine: false,
      theme: 'vs',
    };
  }

  onEditorInitialized(codeEditor: monaco.editor.IStandaloneCodeEditor) {
    this.codeEditor = codeEditor;
    // this.logger.log('editor initialized');
  }

  onClickQuit() {
    this.quitPreview.next();
  }

  onClickNewQuestion() {
    this.newQuestion.next();
  }
}
