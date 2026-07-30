import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule, UrlSegment } from '@angular/router';

import { firstValueFrom } from 'rxjs';

import { OperatorUsersInvitationService, OperatorUsersService } from '@mrtm/api';

import { ActivatedRouteStub, mockClass, RouterStubComponent } from '@netz/common/testing';

import { CreateUserAuthorityComponent } from '@accounts/containers/create-user-authority/create-user-authority.component';
import { UserAuthorityStore } from '@accounts/store';
import {
  selectIsInitiallySubmitted,
  selectNewUserAuthority,
  selectSubmissionErrors,
} from '@accounts/store/user-authority.selectors';
import { mockOperatorUser } from '@accounts/testing/accounts-data.mock';
import { SubmissionError } from '@shared/types';

describe('CreateUserAuthorityComponent', () => {
  let component: CreateUserAuthorityComponent;
  let fixture: ComponentFixture<CreateUserAuthorityComponent>;
  let router: Router;
  let store: UserAuthorityStore;
  const route = new ActivatedRouteStub();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateUserAuthorityComponent,
        RouterModule.forRoot([
          {
            path: 'summary',
            component: RouterStubComponent,
          },
        ]),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: OperatorUsersInvitationService, useValue: mockClass(OperatorUsersInvitationService) },
        { provide: OperatorUsersService, useValue: mockClass(OperatorUsersService) },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    route.setUrl([new UrlSegment('/', { accountId: '1', userType: 'operator_admin' })]);

    fixture = TestBed.createComponent(CreateUserAuthorityComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(UserAuthorityStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set newUserAuthority and isInitiallySubmitted in store when submitting the form', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue(mockOperatorUser);
    component.handleSubmit();

    const iis = await firstValueFrom(store.pipe(selectIsInitiallySubmitted));
    const na = await firstValueFrom(store.pipe(selectNewUserAuthority));
    expect(iis).toEqual(true);
    expect(na).toEqual(mockOperatorUser);
    expect(navigateSpy).toHaveBeenCalledWith(['summary'], { relativeTo: route });
  });

  it('should display errors when final submission has failed and user has been redirected back to form to correct their input', () => {
    store.setSubmissionErrors([
      {
        control: 'email',
        validationErrors: {
          emailExists: 'Some error',
        },
      },
    ]);
    fixture.detectChanges();
    expect(component.form.invalid).toEqual(true);
    expect(component.form.touched).toEqual(true);
    expect(fixture.debugElement.query(By.css('govuk-error-summary'))).toBeTruthy();
    // Test automatic reset of submission errors.
    let submissionErrors: SubmissionError[] = null;
    store.pipe(selectSubmissionErrors).subscribe((result) => (submissionErrors = result));
    expect(submissionErrors).toHaveLength(0);
  });
});
