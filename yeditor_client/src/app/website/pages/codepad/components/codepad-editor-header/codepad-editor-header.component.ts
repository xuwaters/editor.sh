import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Language, Languages } from 'app/website/shared/models/languages.model';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { CodepadLanguageDialogComponent, LanguageDialogResult } from '../codepad-language-dialog/codepad-language-dialog.component';
import { CodepadLangcodeDialogComponent } from '../codepad-langcode-dialog/codepad-langcode-dialog.component';

@Component({
  selector: 'app-codepad-editor-header',
  templateUrl: './codepad-editor-header.component.html',
  styleUrls: ['./codepad-editor-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodepadEditorHeaderComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private logger: LoggerService,
  ) { }

  @Output() runCode = new EventEmitter<any>();
  @Output() languageChange = new EventEmitter<Language>();

  @Input() language: Language = Languages.typescript;

  get languageName(): string {
    return this.language ? this.language.name : '';
  }

  ngOnInit() {
  }

  onRunClick() {
    this.runCode.emit();
  }

  showLanguageDialog() {
    const dialogRef = this.dialog.open(CodepadLanguageDialogComponent, {
      position: { left: '350px', top: '65px' },
    });
    dialogRef.afterClosed().subscribe((it: LanguageDialogResult) => this.onLanguageDialogResult(it));
  }

  showLanguageInfo(language: Language) {
    this.logger.log('show language info: ', language);
    this.dialog.open(CodepadLangcodeDialogComponent, {
      position: { left: '350px', top: '65px' },
      data: { language: language.id },
    });
  }

  changeLanguage(language: Language) {
    if (this.language.id !== language.id) {
      this.language = language;
      this.changeDetectorRef.markForCheck();
    }
  }

  private onLanguageDialogResult(it: LanguageDialogResult) {
    if (!it) {
      return;
    }
    // this.logger.log('action = ', it.action, 'lang = ', it.language);
    if (it.action === LanguageDialogResult.ACTION_SHOW_INFO) {
      this.showLanguageInfo(it.language);
      return;
    }
    if (it.action === LanguageDialogResult.ACTION_SELECT) {
      this.languageChange.emit(it.language);
      return;
    }
  }
}
