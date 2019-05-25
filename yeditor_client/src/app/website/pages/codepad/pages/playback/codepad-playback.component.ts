import { ActivatedRoute, UrlSegment } from '@angular/router';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { LoggerService } from 'app/website/shared/services/common/logger.service';

@Component({
  selector: 'app-codepad-playback',
  templateUrl: './codepad-playback.component.html',
  styleUrls: ['./codepad-playback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodepadPlaybackComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private logger: LoggerService,
  ) { }

  ngOnInit() {
    this.activatedRoute.parent.url.subscribe((value: UrlSegment[]) => {
      this.logger.log('playback: url segments = ', JSON.stringify(value));
      const hashcode = value[0].path;
    });
  }

}
