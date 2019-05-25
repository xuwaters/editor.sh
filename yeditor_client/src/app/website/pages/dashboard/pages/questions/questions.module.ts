import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { //
  MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatIconModule, //
  MatInputModule, MatListModule, MatSelectModule, MatSidenavModule
} from '@angular/material';
import { Route, RouterModule } from '@angular/router';
import { MomentModule } from 'angular2-moment';
import { LanguageSelectorModule } from 'app/website/shared-ui/language-selector/language-selector.module';
import { MonacoEditorModule } from 'app/website/shared-ui/monaco-editor/monaco-editor.module';
import { QuestionEditorComponent } from './components/question-editor/question-editor.component';
import { QuestionPreviewComponent } from './components/question-preview/question-preview.component';
import { QuestionsSidebarComponent } from './components/questions-sidebar/questions-sidebar.component';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { QuestionsCreateComponent } from './pages/create/questions-create.component';
import { QuestionsEditComponent } from './pages/edit/questions-edit.component';
import { QuestionsListComponent } from './pages/list/questions-list.component';


const extraModules = [
  MonacoEditorModule,
  LanguageSelectorModule,
  CommonModule,
  MomentModule,
  FlexLayoutModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatAutocompleteModule,
  FormsModule,
  ReactiveFormsModule, // should import this module while using 'formControl'
];

const questionsRoutes: Route[] = [
  { path: '', component: QuestionsListComponent, pathMatch: 'full' },
  { path: 'create', component: QuestionsCreateComponent },
  { path: 'edit/:question_id', component: QuestionsEditComponent },
  { path: ':question_id', component: QuestionsListComponent, pathMatch: 'full' },
];

@NgModule({
  declarations: [
    SearchBoxComponent,
    QuestionsSidebarComponent,
    QuestionPreviewComponent,
    QuestionEditorComponent,
    // pages
    QuestionsListComponent,
    QuestionsCreateComponent,
    QuestionsEditComponent,
  ],
  imports: [
    ...extraModules,
    RouterModule.forChild(questionsRoutes),
  ],
  exports: [
    RouterModule,
  ],
  providers: [],
})
export class QuestionsModule { }
