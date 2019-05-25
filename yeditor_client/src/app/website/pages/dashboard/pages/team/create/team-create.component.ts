import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-team-create',
  templateUrl: './team-create.component.html',
  styleUrls: ['./team-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamCreateComponent implements OnInit {
  constructor() { }

  ngOnInit() { }
}
