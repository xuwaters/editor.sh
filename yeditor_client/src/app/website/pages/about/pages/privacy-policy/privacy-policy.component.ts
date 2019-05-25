import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ConfigService } from 'app/website/shared/services/common/config.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: [
    '../../styles/common.scss',
    './privacy-policy.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicyComponent implements OnInit {
  constructor(
    public config: ConfigService,
  ) { }

  ngOnInit() { }

}
