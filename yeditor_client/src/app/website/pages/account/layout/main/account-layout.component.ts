import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-account-layout',
  templateUrl: './account-layout.component.html',
  styleUrls: ['./account-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountLayoutComponent implements OnInit {
  constructor() { }

  ngOnInit() { }
}
