import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-billing-list',
  templateUrl: './billing-list.component.html',
  styleUrls: ['./billing-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingListComponent implements OnInit {
  constructor() { }

  ngOnInit() { }
}
