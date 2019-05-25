
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FaqItem } from '../../models/faq-item.model';

@Component({
  selector: 'app-faq-item',
  templateUrl: './faq-item.component.html',
  styleUrls: ['./faq-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqItemComponent implements OnInit {
  @Input() item: FaqItem = new FaqItem();

  constructor() { }

  ngOnInit() { }
}
