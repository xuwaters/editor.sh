import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-account-links',
  templateUrl: './account-links.component.html',
  styleUrls: ['./account-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountLinksComponent implements OnInit {
  constructor() { }

  @Input() showRegister = true;
  @Input() showLogin = true;
  @Input() showPasswordReset = true;
  @Input() showConfirmation = true;
  @Input() showUnlock = true;

  ngOnInit() { }
}
