import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-account-unlock',
  templateUrl: './account-unlock.component.html',
  styleUrls: ['./account-unlock.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountUnlockComponent implements OnInit {
  constructor() { }

  userEmail = '';

  ngOnInit() { }

  onUnlock() {
  }
}
