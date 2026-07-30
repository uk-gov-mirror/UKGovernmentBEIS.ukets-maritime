import { APP_BASE_HREF } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { UserStateDTO } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { KeycloakService } from '@core/services';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  const originalConsole = console;
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let page: Page;
  let authStore: AuthStore;

  const setUser: (roleType: UserStateDTO['roleType'], loginStatus?: UserStateDTO['status']) => void = (
    roleType,
    loginStatus?,
  ) => {
    authStore.setUserState({
      ...authStore.state.userState,
      status: loginStatus,
      roleType,
    });

    fixture.detectChanges();
  };

  class Page extends BasePage<AppComponent> {
    get footer() {
      return this.query<HTMLElement>('.govuk-footer');
    }

    get dashboardLink() {
      return this.query<HTMLAnchorElement>('govuk-header-nav-list-legacy a[href="/maritime/dashboard"]');
    }

    get accountsLink() {
      return this.query<HTMLAnchorElement>('govuk-header-nav-list-legacy a[href="/maritime/accounts"]');
    }

    get regulatorsLink() {
      return this.query<HTMLAnchorElement>('a[href="/maritime/user/regulators"]');
    }

    get verificationBodiesLink() {
      return this.query<HTMLAnchorElement>('a[href="/maritime/verification-bodies"]');
    }

    get templatesLink() {
      return this.query<HTMLAnchorElement>('a[href="/maritime/templates"]');
    }

    get navList() {
      return this.query<HTMLDivElement>('govuk-header-nav-list-legacy');
    }

    get breadcrumbs() {
      return this.queryAll<HTMLLIElement>('.govuk-breadcrumbs__list-item');
    }
  }

  beforeAll(() => {
    console.warn = vi.fn();
  });

  afterAll(() => {
    console = originalConsole;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        KeycloakService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub(),
        },
        { provide: APP_BASE_HREF, useValue: '/maritime/' },
      ],
    }).compileComponents();

    authStore = TestBed.inject(AuthStore);
    authStore.setIsLoggedIn(true);
    authStore.setUserState({ roleType: 'OPERATOR', status: 'NO_AUTHORITY' });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render the footer', () => {
    expect(page.footer).toBeTruthy();
  });

  it('should not render the dashboard link for disabled users or an operator with no authority', () => {
    setUser('OPERATOR', 'NO_AUTHORITY');

    expect(page.dashboardLink).toBeFalsy();

    setUser('OPERATOR', 'ENABLED');

    expect(page.dashboardLink).toBeTruthy();

    setUser('REGULATOR', 'ENABLED');

    expect(page.dashboardLink).toBeTruthy();

    setUser('REGULATOR', 'DISABLED');

    expect(page.dashboardLink).toBeFalsy();
  });

  it('should render the regulators link only if the user is regulator', () => {
    setUser('OPERATOR', 'NO_AUTHORITY');

    expect(page.regulatorsLink).toBeFalsy();

    setUser('REGULATOR', 'ENABLED');

    expect(page.regulatorsLink).toBeTruthy();
  });

  it('should render the verification body accounts link', () => {
    setUser('OPERATOR', 'NO_AUTHORITY');

    expect(page.verificationBodiesLink).toBeFalsy();

    setUser('REGULATOR', 'ENABLED');

    expect(page.verificationBodiesLink).toBeTruthy();
  });

  it('should render the accounts link only if the user is regulator, verifier or authorized operator', () => {
    setUser('OPERATOR', 'NO_AUTHORITY');

    expect(page.accountsLink).toBeFalsy();

    setUser('REGULATOR', 'ENABLED');

    expect(page.accountsLink).toBeTruthy();

    setUser('OPERATOR', 'ENABLED');

    expect(page.accountsLink).toBeTruthy();
  });

  it('should render the templates link only if the user is a regulator', () => {
    setUser('OPERATOR', 'ENABLED');

    expect(page.templatesLink).toBeFalsy();

    setUser('VERIFIER', 'ENABLED');

    expect(page.templatesLink).toBeFalsy();

    setUser('REGULATOR', 'ENABLED');

    expect(page.templatesLink).toBeTruthy();
  });

  it('should not render the nav list if user is disabled', () => {
    setUser('REGULATOR', 'ENABLED');
    expect(page.navList).toBeTruthy();

    setUser('REGULATOR', 'DISABLED');
    fixture.detectChanges();

    expect(page.navList).toBeFalsy();

    setUser('VERIFIER', 'TEMP_DISABLED');
    fixture.detectChanges();

    expect(page.navList).toBeFalsy();
  });

  it('should not render the nav list if user is not logged in', () => {
    authStore.setIsLoggedIn(false);
    setUser('OPERATOR', 'NO_AUTHORITY');

    expect(page.navList).toBeFalsy();

    authStore.setIsLoggedIn(true);
    setUser('OPERATOR', 'ENABLED');

    expect(page.navList).toBeTruthy();

    authStore.setIsLoggedIn(false);
    fixture.detectChanges();

    expect(page.navList).toBeFalsy();
  });
});
