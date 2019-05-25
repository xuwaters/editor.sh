import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FaqItem } from '../models/faq-item.model';
import { PlanItem } from '../models/plan-item.model';


@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingComponent implements OnInit {

  planItems = defaultPlanItems;
  faqItems = defaultFaqItems;

  constructor() { }

  ngOnInit() { }
}

const defaultPlanItems: PlanItem[] = [
  {
    borderColor: '#e53b7d',
    title: 'Personal',
    price: '$0',
    period: '/ month',
    description: 'Starter plan',
    features: [
      '1 user account',
      'Pay as you go',
    ],
    action: { name: 'Select Plan', link: '/dashboard/billing/plans' },
  },
  {
    borderColor: '#23cecd',
    title: 'Small Team',
    price: '$0',
    period: '/ month',
    description: 'Smaller teams',
    features: [
      '10 user account',
      '60 interviews / month',
    ],
    action: { name: 'Select Plan', link: '/dashboard/billing/plans' },
  },
  {
    borderColor: '#93bc10',
    title: 'Business',
    price: '$0',
    period: '/ month',
    description: 'Larger teams',
    features: [
      '30 user account',
      '250 interviews / month',
    ],
    action: { name: 'Select Plan', link: '/dashboard/billing/plans' },
  },
  {
    borderColor: '#2f52ea',
    title: 'Enterprise',
    price: 'Varies',
    period: '',
    description: 'Big teams',
    features: [
      'Unlimited user accounts',
      'Unlimited interviews / month',
      'API Integration',
    ],
    action: {
      name: 'Contact US', click: () => {
        console.log('contact us clicked.');
      }
    },
  }
];

const defaultFaqItems: FaqItem[] = [
  {
    question: `Sample Question 1?`,
    answer: `
    Sample Answer 1.
    `,
  },
  {
    question: `Sampel Question 2?`,
    answer: `
    Sample Answer 2.
     `,
  },
  {
    question: `Sampel Question 3?`,
    answer: `
    Sample Answer 3.
     `,
  },
  {
    question: `Sampel Question 4?`,
    answer: `
    Sample Answer 4.
     `,
  },
];
