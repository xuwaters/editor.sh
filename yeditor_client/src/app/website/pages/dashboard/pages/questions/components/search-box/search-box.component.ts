
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBoxComponent implements OnInit {

  @ViewChild('searchBox') searchBox: ElementRef;

  placeholder = 'Search';
  value = '';

  constructor() { }

  ngOnInit() { }
}
