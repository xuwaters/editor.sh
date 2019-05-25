import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-account-confirmation',
  templateUrl: './account-confirmation.component.html',
  styleUrls: ['./account-confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountConfirmationComponent implements OnInit {
  constructor() { }

  userEmail = '';

  ngOnInit() { }

  onConfirmation() {

  }
}
