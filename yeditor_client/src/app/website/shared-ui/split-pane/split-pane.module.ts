import { SplitGutterDirective } from './directive/split-gutter.directive';
import { SplitAreaDirective } from './directive/split-area.directive';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitPaneComponent } from './components/split-pane.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    SplitPaneComponent,
    SplitAreaDirective,
    SplitGutterDirective,
  ],
  exports: [
    SplitPaneComponent,
    SplitAreaDirective,
  ],
})
export class SplitPaneModule { }
