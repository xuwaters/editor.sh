import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { PlanItem } from '../../models/plan-item.model';


@Component({
  selector: 'app-plan-item',
  templateUrl: './plan-item.component.html',
  styleUrls: ['./plan-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanItemComponent implements OnInit {
  @Input() item: PlanItem = new PlanItem();

  get clsBorderTop(): string {
    return `4px solid ${this.item.borderColor}`;
  }

  constructor() { }

  ngOnInit() { }
}
