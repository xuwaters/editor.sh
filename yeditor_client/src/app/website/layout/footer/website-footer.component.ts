import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ConfigService } from 'app/website/shared/services/common/config.service';
import { PlatformService } from 'app/website/shared/services/common/platform.service';
import { Subscription } from 'rxjs/Subscription';



@Component({
  selector: 'app-website-footer',
  templateUrl: './website-footer.component.html',
  styleUrls: ['./website-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebsiteFooterComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private platformService: PlatformService,
    private config: ConfigService,
  ) {
  }

  footerLinks = defaultFooterLinks;
  contact: FooterLink = {
    text: this.config.supportEmail,
    link: 'mailto:' + this.config.supportEmail,
  };
  copyRight = this.config.websiteCopyRight;

  private navSubscription: Subscription;

  ngOnDestroy() {
    if (this.navSubscription) {
      this.navSubscription.unsubscribe();
      this.navSubscription = undefined;
    }
  }

  ngOnInit() {
    if (this.platformService.isBrowser) {
      this.navSubscription = this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          window.scrollTo(0, 0);
        }
      });
    }
  }
}

export class FooterLink {
  text = '';
  link?: string;
  routerLink?: string;
}

const defaultFooterLinks: FooterLink[][] = [
  [
    // { text: 'Features', routerLink: '/features' },
    // { text: 'Pricing', routerLink: '/pricing' },
    // { text: 'Supported Languages', routerLink: '/languages' },
  ],
  [
    // { text: 'Testimonials', routerLink: '/about/testimonials' },
    // { text: 'Terms of Service', routerLink: '/about/terms-of-service' },
    // { text: 'Privacy Policy', routerLink: '/about/privacy-policy' },
  ],
  [
    // { text: 'Getting Started: Interviewers', routerLink: '/help/getting-started-interviewers' },
    // { text: 'Getting Started: Recruiters', routerLink: '/help/getting-started-recruiters' },
    // { text: 'Getting Started: Candidates', routerLink: '/help/getting-started-candidates' },
  ]
];
