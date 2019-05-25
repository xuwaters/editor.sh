import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Language, LanguageList } from 'app/website/shared/models/languages.model';

@Component({
  selector: 'app-codepad-language-dialog',
  templateUrl: './codepad-language-dialog.component.html',
  styleUrls: ['./codepad-language-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodepadLanguageDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<CodepadLanguageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  languages = LanguageList;

  ngOnInit() { }

  onNoClick() {
    this.dialogRef.close(null);
  }

  onSelectLanguage(lang: Language) {
    this.dialogRef.close(new LanguageDialogResult(lang, LanguageDialogResult.ACTION_SELECT));
  }

  onShowLanguageInfo(lang: Language, event: Event) {
    event.stopPropagation();
    this.dialogRef.close(new LanguageDialogResult(lang, LanguageDialogResult.ACTION_SHOW_INFO));
  }
}

export class LanguageDialogResult {
  static readonly ACTION_SELECT = 'select';
  static readonly ACTION_SHOW_INFO = 'show-info';

  constructor(
    public language: Language,
    public action: string,
  ) { }
}
