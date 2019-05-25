import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-codepad-xterm-header',
  templateUrl: './codepad-xterm-header.component.html',
  styleUrls: ['./codepad-xterm-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodepadXtermHeaderComponent implements OnInit {
  constructor() { }

  @Output() reset = new EventEmitter<any>();

  ngOnInit() { }

  onResetClick() {
    this.reset.emit();
  }
}
