import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

import { combineLatest, filter, map, Observable, of, switchMap, take, takeUntil } from 'rxjs';

import { AuthStore, selectIsLoggedIn, selectUserState } from '@netz/common/auth';
import { BackLinkComponent, BreadcrumbsComponent } from '@netz/common/navigation';
import { DestroySubject } from '@netz/common/services';
import {
  FooterComponent,
  HeaderActionsListComponent,
  HeaderLegacyComponent,
  LinkDirective,
  MetaInfoComponent,
  NavListLegacyComponent,
  SkipLinkComponent,
} from '@netz/govuk-components';

import { CookiesService } from '@cookies/cookies.service';
import { CookiesContainerComponent } from '@cookies/cookies-container.component';
import { ConfigStore, selectIsFeatureEnabled } from '@core/config';
import { AuthService } from '@core/services';
import { AnalyticsService } from '@core/services/analytics.service';
import { hasNoAuthority, loginDisabled, shouldShowAccepted } from '@core/util';
import { IncorporateHeaderComponent } from '@incorporate-header/incorporate-header.component';
import { PhaseBarComponent } from '@shared/components';
import { TimeoutBannerComponent } from '@timeout/timeout-banner';

interface Permissions {
  showRegulators: boolean;
  showVerifiers: boolean;
  showAuthorizedOperators: boolean;
}

@Component({
  selector: 'mrtm-root',
  imports: [
    CookiesContainerComponent,
    HeaderLegacyComponent,
    SkipLinkComponent,
    HeaderActionsListComponent,
    RouterLink,
    NavListLegacyComponent,
    LinkDirective,
    PhaseBarComponent,
    BreadcrumbsComponent,
    BackLinkComponent,
    RouterOutlet,
    FooterComponent,
    MetaInfoComponent,
    TimeoutBannerComponent,
    AsyncPipe,
    IncorporateHeaderComponent,
  ],
  standalone: true,
  templateUrl: './app.component.html',
  providers: [DestroySubject],
})
export class AppComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly configStore = inject(ConfigStore);
  private readonly titleService = inject(Title);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = inject(DestroySubject);
  private readonly cookiesService = inject(CookiesService);
  private readonly analyticsService = inject(AnalyticsService);

  rootUrl: string = location.origin;
  serviceGatewayUrl: string = this.rootUrl;
  isGatewayServiceEnabled$ = this.configStore.pipe(selectIsFeatureEnabled('serviceGatewayEnabled'));
  permissions$: Observable<null | Permissions>;
  isLoggedIn$ = this.authStore.rxSelect(selectIsLoggedIn).pipe(takeUntil(this.destroy$));
  showCookiesBanner$ = this.cookiesService.accepted$.pipe(
    map((cookiesAccepted) => !cookiesAccepted),
    take(1),
  );
  private readonly userState$ = this.authStore.rxSelect(selectUserState).pipe(takeUntil(this.destroy$));
  private readonly roleType$ = this.userState$.pipe(
    map((userState) => userState?.roleType),
    takeUntil(this.destroy$),
  );

  ngOnInit(): void {
    this.permissions$ = combineLatest([this.isLoggedIn$]).pipe(
      switchMap(([isLoggedIn]) =>
        isLoggedIn
          ? combineLatest([
              this.userState$.pipe(map((userState) => loginDisabled(userState) || shouldShowAccepted(userState))),
              this.roleType$.pipe(map((role) => role === 'REGULATOR')),
              this.roleType$.pipe(map((role) => role === 'VERIFIER')),
              this.userState$.pipe(
                map(
                  (userState) => userState !== null && userState.roleType === 'OPERATOR' && !hasNoAuthority(userState),
                ),
              ),
            ]).pipe(
              map(
                ([isDisabled, showRegulators, showVerifiers, showAuthorizedOperators]) =>
                  !isDisabled &&
                  Object.values({
                    showRegulators,
                    showVerifiers,
                    showAuthorizedOperators,
                  }).some((permission) => !!permission) && {
                    showRegulators,
                    showVerifiers,
                    showAuthorizedOperators,
                  },
              ),
            )
          : of(null),
      ),
    );

    const appTitle = this.titleService.getTitle();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let child = this.route.firstChild;
          while (child.firstChild) {
            child = child.firstChild;
          }
          if (child.snapshot.data['pageTitle']) {
            return child.snapshot.data['pageTitle'];
          }
          return appTitle;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((title: string) => this.titleService.setTitle(`${title} - GOV.UK`));

    if (this.cookiesService.accepted$.getValue() && this.cookiesService.hasAnalyticsConsent()) {
      this.analyticsService.enableGoogleTagManager();
    }
  }

  public async logout(event: MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    await this.authService.logout();
  }
}
