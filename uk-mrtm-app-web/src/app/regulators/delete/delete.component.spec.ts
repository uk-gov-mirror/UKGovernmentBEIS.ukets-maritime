import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { of, throwError } from 'rxjs';

import { RegulatorAuthoritiesService, UserDTO } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { ErrorCodes } from '@netz/common/error';
import {
  ActivatedRouteStub,
  BasePage,
  BusinessErrorStubComponent,
  expectBusinessErrorToBe,
  expectToHaveNavigatedTo,
  RouterStubComponent,
} from '@netz/common/testing';

import { AuthService } from '@core/services/auth.service';
import { DeleteComponent } from '@regulators/delete/delete.component';
import { saveNotFoundRegulatorError } from '@regulators/errors/business-error';
import { Mocked } from 'vitest';

describe('DeleteComponent', () => {
  let component: DeleteComponent;
  let fixture: ComponentFixture<DeleteComponent>;
  let page: Page;
  let authStore: AuthStore;

  class Page extends BasePage<DeleteComponent> {
    get cancelLink() {
      return this.queryAll<HTMLAnchorElement>('a').find((element) => element.textContent.trim() === 'Cancel');
    }

    get submitButton() {
      return this.queryAll<HTMLButtonElement>('button')[0];
    }

    get panelTitle() {
      return this.query<HTMLDivElement>('.govuk-panel__title');
    }

    get returnLink() {
      return this.query<HTMLAnchorElement>('a');
    }
  }

  const user: UserDTO = {
    email: 'alfyn-octo@netz.uk',
    firstName: 'Alfyn',
    lastName: 'Octo',
  };

  let regulatorAuthoritiesService: Partial<Mocked<RegulatorAuthoritiesService>>;

  let authService: Partial<Mocked<AuthService>>;

  beforeEach(async () => {
    const activatedRoute = new ActivatedRouteStub({ userId: '1reg' }, null, { user });
    authService = {
      logout: vi.fn(),
    };
    regulatorAuthoritiesService = {
      deleteRegulatorUserByCompetentAuthority: vi.fn().mockReturnValue(of(null)),
      deleteCurrentRegulatorUserByCompetentAuthority: vi.fn().mockReturnValue(of(null)),
    };

    await TestBed.configureTestingModule({
      imports: [DeleteComponent, RouterStubComponent],
      providers: [
        provideRouter([
          { path: 'user/regulators', component: RouterStubComponent },
          { path: 'error/business', component: BusinessErrorStubComponent },
        ]),
        { provide: RegulatorAuthoritiesService, useValue: regulatorAuthoritiesService },
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    authStore = TestBed.inject(AuthStore);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain a heading with regulator name', () => {
    expect(page.heading2.textContent).toContain(`${user.firstName} ${user.lastName}`);
  });

  it('should contain cancel and delete buttons', () => {
    expect(page.cancelLink.textContent.trim()).toEqual('Cancel');
    expect(page.submitButton.textContent.trim()).toEqual('Confirm deletion');
  });

  it('should return without reload on cancel click', async () => {
    page.cancelLink.click();
    await fixture.whenStable();

    expectToHaveNavigatedTo('/user/regulators#regulator-users');
  });

  it('should delete regulator and logout if current user', () => {
    authStore.setUserState({ userId: '1reg' });

    page.submitButton.click();

    expect(regulatorAuthoritiesService.deleteCurrentRegulatorUserByCompetentAuthority).toHaveBeenCalled();
    expect(regulatorAuthoritiesService.deleteRegulatorUserByCompetentAuthority).not.toHaveBeenCalled();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should delete regulator on confirm delete click', () => {
    authStore.setUserState({ userId: '1' });

    page.submitButton.click();

    expect(regulatorAuthoritiesService.deleteCurrentRegulatorUserByCompetentAuthority).not.toHaveBeenCalled();
    expect(regulatorAuthoritiesService.deleteRegulatorUserByCompetentAuthority).toHaveBeenCalledWith('1reg');
  });

  it('should show confirmation screen on delete', async () => {
    authStore.setUserState({ userId: '1' });

    page.submitButton.click();
    fixture.detectChanges();

    expect(page.panelTitle.textContent).toContain(user.firstName);
    expect(page.panelTitle.textContent).toContain(user.lastName);

    page.returnLink.click();
    await fixture.whenStable();

    expectToHaveNavigatedTo('/user/regulators#regulator-users');
  });

  it('should dismiss with a message if error', async () => {
    authStore.setUserState({ userId: '1' });
    regulatorAuthoritiesService.deleteRegulatorUserByCompetentAuthority.mockReturnValue(
      throwError(() => new HttpErrorResponse({ error: { code: ErrorCodes.AUTHORITY1003 }, status: 400 })),
    );

    page.submitButton.click();

    await expectBusinessErrorToBe(saveNotFoundRegulatorError);
  });
});
