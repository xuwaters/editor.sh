import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { Languages, Language } from 'app/website/shared/models/languages.model';

@Component({
  selector: 'app-codepad-langcode-dialog',
  templateUrl: './codepad-langcode-dialog.component.html',
  styleUrls: ['./codepad-langcode-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodepadLangcodeDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<CodepadLangcodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private logger: LoggerService,
  ) { }

  language: Language;
  editorOptions: monaco.editor.IEditorConstructionOptions = {
    theme: 'vs-dark',
    lineNumbers: 'off',
    language: 'typescript',
    wordWrap: 'off',
    minimap: { enabled: false, renderCharacters: false },
    scrollBeyondLastLine: false,
    value: '',
    readOnly: true,
  };

  ngOnInit() {
    let languageId = this.data.language;
    this.logger.log('show language example for:', languageId);
    this.language = Languages.getLanguageById(languageId);

    if (this.language) {
      this.editorOptions.language = this.language.editorLanguage;
      this.editorOptions.value = this.language.langcode.code;
    } else {
      this.logger.log('language not found:', languageId);
    }
  }

  onNoClick() {
    this.dialogRef.close(null);
  }

}
