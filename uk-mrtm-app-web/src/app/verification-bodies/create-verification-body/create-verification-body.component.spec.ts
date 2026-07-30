import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { VerificationBodiesService, VerifierAuthoritiesService } from '@mrtm/api';

import { ActivatedRouteStub, BasePage, mockClass } from '@netz/common/testing';

import { CountryService } from '@core/services';
import { CountryServiceStub } from '@registration/testing/country-service-stub';
import { CreateVerificationBodyComponent } from '@verification-bodies//create-verification-body/create-verification-body.component';
import { VerificationBodiesStoreService } from '@verification-bodies/+state/verification-bodies-store.service';

describe('CreateVerificationBodyComponent', () => {
  let component: CreateVerificationBodyComponent;
  let fixture: ComponentFixture<CreateVerificationBodyComponent>;
  let page: Page;
  let store: VerificationBodiesStoreService;

  const activatedRoute = new ActivatedRouteStub();

  class Page extends BasePage<CreateVerificationBodyComponent> {}

  const createComponent = () => {
    fixture = TestBed.createComponent(CreateVerificationBodyComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateVerificationBodyComponent],
      providers: [
        { provide: VerificationBodiesService, useValue: mockClass(VerificationBodiesService) },
        { provide: VerifierAuthoritiesService, useValue: mockClass(VerifierAuthoritiesService) },
        { provide: CountryService, useClass: CountryServiceStub },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    store = TestBed.inject(VerificationBodiesStoreService);
  });

  afterEach(() => vi.clearAllMocks());

  beforeEach(() => createComponent());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct page heading', () => {
    expect(page.heading1.textContent.trim()).toBe('Verification body details');
  });

  it('should show error summary when form is submitted without required fields', () => {
    expect(page.errorSummary).toBeNull();

    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).not.toBeNull();
  });

  it('should save form values to store and navigate to summary on form submit', () => {
    const navigateSpy = vi.spyOn((component as any).router, 'navigate').mockResolvedValue(true);
    const setNewVerificationBodySpy = vi.spyOn(store, 'setNewVerificationBody');

    component.handleFormSubmit();

    expect(setNewVerificationBodySpy).toHaveBeenCalledWith(component.form.getRawValue());
    expect(navigateSpy).toHaveBeenCalledWith(['summary'], { relativeTo: activatedRoute });
  });

  describe('when submission errors are present in store on init', () => {
    const submissionErrors = [{ control: 'name', validationErrors: { serverError: 'Name already taken' } }];

    beforeEach(() => {
      store.setSubmissionErrors(submissionErrors);
      createComponent();
    });

    it('should apply submission errors to the corresponding form controls', () => {
      expect(component.form.get('name').errors).toEqual({ serverError: 'Name already taken' });
    });

    it('should clear submission errors from the store after applying them', () => {
      expect(store.getState().createVerificationBody.submissionErrors).toBeNull();
    });
  });
});
