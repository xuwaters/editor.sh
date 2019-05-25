import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ConfigService } from 'app/website/shared/services/common/config.service';


@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: [
    '../../styles/common.scss',
    './testimonials.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsComponent implements OnInit {
  constructor(
    public config: ConfigService,
  ) { }

  ngOnInit() { }
}
