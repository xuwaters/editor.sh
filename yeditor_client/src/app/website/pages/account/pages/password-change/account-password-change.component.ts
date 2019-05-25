import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-account-password-change',
  templateUrl: './account-password-change.component.html',
  styleUrls: ['./account-password-change.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPasswordChangeComponent implements OnInit {
  constructor() { }

  ngOnInit() { }
}
