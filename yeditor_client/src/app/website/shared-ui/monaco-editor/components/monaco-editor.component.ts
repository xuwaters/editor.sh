import { //
  AfterViewInit, //
  ChangeDetectionStrategy, //
  Component, //
  ElementRef, //
  EventEmitter, //
  forwardRef, //
  Input, //
  NgZone, //
  OnDestroy, //
  Output, //
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PlatformService } from 'app/website/shared/services/common/platform.service';
import { fromEvent } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';

export type EditorChangeHandler = (event: monaco.editor.IModelContentChangedEvent) => void;

// global variables for loading monaco library
let monacoLoading = false;
let monacoLoadPromise: Promise<void>;

@Component({
  selector: 'app-monaco-editor',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MonacoEditorComponent), multi: true },
  ],
  template: `<div class="editorContainer" #editorContainer></div>`,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .editorContainer {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonacoEditorComponent implements ControlValueAccessor, OnDestroy, AfterViewInit {

  constructor(
    private zone: NgZone,
    private platformService: PlatformService
  ) {
  }

  @Output()
  editorDidMount = new EventEmitter<any>();

  @ViewChild('editorContainer')
  private editorContainer: ElementRef;

  // private editorValue = '';
  private editor: monaco.editor.IStandaloneCodeEditor;
  private editorOptions: monaco.editor.IEditorConstructionOptions;
  private windowResizeSubscription: Subscription;

  private onChange: EditorChangeHandler = null;
  private onTouched = () => { };

  get codeEditor(): monaco.editor.IStandaloneCodeEditor {
    return this.editor;
  }

  @Input('options')
  set options(value: monaco.editor.IEditorConstructionOptions) {
    this.editorOptions = value;
    if (this.editor) {
      this.editor.dispose();
      this.initMonaco(value);
    }
  }

  get options(): monaco.editor.IEditorConstructionOptions {
    return this.editorOptions;
  }

  ngAfterViewInit(): void {
    if (this.platformService.isBrowser) {
      loadMonacoLibrary().then(() => this.initMonaco(this.options));
    }
  }

  ngOnDestroy(): void {
    if (this.windowResizeSubscription) {
      this.windowResizeSubscription.unsubscribe();
      this.windowResizeSubscription = undefined;
    }
    if (this.editor) {
      this.editor.dispose();
      this.editor = undefined;
    }
  }

  writeValue(value: string): void {
    // this.editorValue = value || '';
    setTimeout(() => this.editor && this.editor.setValue(value));
  }

  registerOnChange(fn: EditorChangeHandler): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // not support
  }

  changeLanguage(editorLanguage: string) {
    let oldModel = this.editor.getModel();
    let code = oldModel.getValue();
    let model = monaco.editor.createModel(code, editorLanguage);
    this.editor.setModel(model);
    if (oldModel) {
      oldModel.dispose();
    }
  }

  layout(): void {
    if (this.editor) {
      this.editor.layout();
    }
  }

  private initMonaco(options: monaco.editor.IEditorConstructionOptions) {
    // create editor
    this.editor = monaco.editor.create(this.editorContainer.nativeElement, options);
    // this.editor.setValue(this.editorValue);
    // listen for change
    this.editor.onDidChangeModelContent((e: monaco.editor.IModelContentChangedEvent) => {
      // const value = this.editor.getValue();
      if (this.onChange) {
        this.onChange(e);
      }
      // value is not propagated to parent when executing outside zone
      // this.zone.run(() => this.editorValue = value);
    });

    // refresh layout
    if (this.windowResizeSubscription) {
      this.windowResizeSubscription.unsubscribe();
    }
    this.windowResizeSubscription = fromEvent(window, 'resize').subscribe(() => {
      this.editor.layout();
    });

    // notify inited
    this.editorDidMount.emit(this.editor);
  }
}

export const loadMonacoLibrary = (): Promise<void> => {
  if (monacoLoading) {
    return monacoLoadPromise;
  }
  monacoLoading = true;
  monacoLoadPromise = new Promise<void>((resolve, reject) => {
    if (typeof ((window as any).monaco) === 'object') {
      resolve();
      return;
    }

    // require method got
    const onGotAmdLoader = () => {
      (window as any).require.config({ paths: { 'vs': '/assets/monaco/vs' } });
      (window as any).require(['vs/editor/editor.main'], () => {
        resolve();
      });
    };

    // load AMD loader if necessary
    if ((window as any).require) {
      onGotAmdLoader();
    } else {
      const loaderScript: HTMLScriptElement = document.createElement('script');
      loaderScript.type = 'text/javascript';
      loaderScript.src = '/assets/monaco/vs/loader.js';

      const removeListeners = () => {
        loaderScript.removeEventListener('load', onLoadScript);
        loaderScript.removeEventListener('error', onErrorScript);
      };
      const onLoadScript = () => {
        removeListeners();
        onGotAmdLoader();
      };
      const onErrorScript = () => {
        removeListeners();
        reject();
      };
      //
      loaderScript.addEventListener('load', onLoadScript);
      loaderScript.addEventListener('error', onErrorScript);
      //
      document.body.appendChild(loaderScript);
    }
  });
  return monacoLoadPromise;
};
