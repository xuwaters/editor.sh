import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule, MatDialogModule, MatTooltipModule } from '@angular/material';
import { Route, RouterModule } from '@angular/router';
import { LanguageSelectorModule } from 'app/website/shared-ui/language-selector/language-selector.module';
import { MonacoEditorModule } from 'app/website/shared-ui/monaco-editor/monaco-editor.module';
import { SplitPaneModule } from 'app/website/shared-ui/split-pane/split-pane.module';
import { XtermModule } from 'app/website/shared-ui/xterm/xterm.module';
import { CodepadStoreModule } from 'app/website/store/codepad/codepad-store.module';
import { CodepadEditorHeaderComponent } from './components/codepad-editor-header/codepad-editor-header.component';
import { CodepadFooterComponent } from './components/codepad-footer/codepad-footer.component';
import { CodepadInviteDialogComponent } from './components/codepad-invite-dialog/codepad-invite-dialog.component';
import { CodepadLangcodeDialogComponent } from './components/codepad-langcode-dialog/codepad-langcode-dialog.component';
import { CodepadLanguageDialogComponent } from './components/codepad-language-dialog/codepad-language-dialog.component';
import { CodepadXtermHeaderComponent } from './components/codepad-xterm-header/codepad-xterm-header.component';
import { CodepadEditComponent } from './pages/edit/codepad-edit.component';
import { CodepadPlaybackComponent } from './pages/playback/codepad-playback.component';


const extraModules = [
  XtermModule,
  MonacoEditorModule,
  LanguageSelectorModule,
  SplitPaneModule,
  CommonModule,
  FlexLayoutModule,
  MatButtonModule,
  MatDialogModule,
  MatTooltipModule,
];

const localRoutes: Route[] = [
  { path: '', component: CodepadEditComponent, pathMatch: 'full' },
  { path: 'playback', component: CodepadPlaybackComponent },
];

@NgModule({
  declarations: [
    CodepadInviteDialogComponent,
    CodepadLanguageDialogComponent,
    CodepadLangcodeDialogComponent,
    CodepadFooterComponent,
    CodepadEditorHeaderComponent,
    CodepadXtermHeaderComponent,
    //
    CodepadEditComponent,
    CodepadPlaybackComponent,
  ],
  // used for dialogs
  entryComponents: [
    CodepadInviteDialogComponent,
    CodepadLanguageDialogComponent,
    CodepadLangcodeDialogComponent,
  ],
  imports: [
    ...extraModules,
    CodepadStoreModule.forRoot(),
    RouterModule.forChild(localRoutes)
  ],
})
export class CodepadModule {

}
