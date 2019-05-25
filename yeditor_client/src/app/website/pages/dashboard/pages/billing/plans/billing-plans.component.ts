
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-billing-plans',
  templateUrl: './billing-plans.component.html',
  styleUrls: ['./billing-plans.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingPlansComponent implements OnInit {
  constructor() { }

  ngOnInit() { }
}
