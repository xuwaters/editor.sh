import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ConfigService } from 'app/website/shared/services/common/config.service';


@Component({
  selector: 'app-terms-of-service',
  templateUrl: './terms-of-service.component.html',
  styleUrls: [
    '../../styles/common.scss',
    './terms-of-service.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsOfServiceComponent implements OnInit {
  constructor(
    public config: ConfigService,
  ) { }

  ngOnInit() { }
}
