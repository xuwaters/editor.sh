import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {

  constructor(
  ) { }

  @Output() trySandbox = new EventEmitter<void>();
  @Output() createPad = new EventEmitter<void>();

  sidebarLinks: SidebarLink[] = defaultSidebarLinks;
  membersLinks: SidebarLink[] = defaultMembersLinks;
  planName = '';


  ngOnInit() { }

  onTrySandbox() {
    this.trySandbox.next();
  }

  onCreatePad() {
    this.createPad.next();
  }
}

export class SidebarLink {
  text = '';
  class = '';
  routerLink = '';
}

const defaultSidebarLinks: SidebarLink[] = [
  { text: 'Pads', routerLink: '/dashboard/pads', class: 'pads' },
  // { text: 'Questions', routerLink: '/dashboard/questions', class: 'questions' },
  // { text: 'Databases', routerLink: '/dashboard/databases', class: 'databases' },
  // { text: 'Usage', routerLink: '/dashboard/usage', class: 'usage' },
  // { text: 'Settings', routerLink: '/dashboard/settings', class: 'settings' },
  // { text: 'Billing', routerLink: '/dashboard/billing', class: 'billing' },
];

const defaultMembersLinks: SidebarLink[] = [
  // {text: 'Create a team', routerLink: '/dashboard/team/create', class: 'members'}
];
