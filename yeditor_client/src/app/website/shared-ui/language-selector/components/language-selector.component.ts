import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Language, LanguageList } from 'app/website/shared/models/languages.model';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-language-selector',
  styles: [''],
  template: `
<mat-form-field>
  <input #languageInput type="search" [placeholder]="placeholder" matInput [formControl]="languageControl"
    [matAutocomplete]="auto" (focus)="onLanguageFocus($event)">
  <mat-autocomplete #auto="matAutocomplete" autoActiveFirstOption [displayWith]="displayLanguage">
    <mat-option *ngFor="let item of filteredLanguages | async" [value]="item">
      {{ item.name }}
    </mat-option>
  </mat-autocomplete>
</mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {

  constructor(
    private logger: LoggerService,
  ) { }

  @Output() languageChanged = new EventEmitter<Language>();

  @Input() placeholder = 'Language';
  @Input() set selectedLanguage(value: Language) { this.languageControl.setValue(value); }
  @Input() languages: Language[] = LanguageList;

  @ViewChild('languageInput') languageInput: ElementRef;

  languageControl: FormControl = new FormControl();
  filteredLanguages: Observable<Language[]>;

  private subscriptions: Subscription[] = [];
  private languageValueChange = new EventEmitter<string>();

  ngOnInit() {
    this.filteredLanguages = this.languageValueChange.pipe(
      startWith('' as any),
      map(language => {
        return language && language instanceof Language ? language.name : language;
      }),
      map(name => {
        return name && name.length > 0 ? this.filterLanguage(name) : this.languages.slice();
      }),
    );
    this.subscriptions.push(this.languageControl.valueChanges.subscribe(it => this.onLanguageChanged(it)));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(it => it.unsubscribe());
    this.subscriptions = [];
  }

  filterLanguage(name: string): Language[] {
    return this.languages.filter(it => it.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  displayLanguage(language: Language): string {
    return language ? language.name : '';
  }

  onLanguageChanged(language: any) {
    this.languageValueChange.emit(language);
    if (language instanceof Language) {
      this.languageChanged.emit(language);
    }
  }

  onLanguageFocus(event: Event) {
    this.languageValueChange.emit('');
    let inputElement = this.languageInput.nativeElement;
    inputElement.setSelectionRange(0, inputElement.value.length);
  }
}
