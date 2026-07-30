import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { VerificationBodiesService, VerifierAuthoritiesService } from '@mrtm/api';

import { ActivatedRouteStub, BasePage, mockClass, MockType } from '@netz/common/testing';

import { CountryService } from '@core/services';
import { CountryServiceStub } from '@registration/testing/country-service-stub';
import { EditComponent } from '@verification-bodies/verification-body-details/edit/edit.component';

describe('EditComponent', () => {
  let component: EditComponent;
  let fixture: ComponentFixture<EditComponent>;
  let page: Page;

  const activatedRoute = new ActivatedRouteStub();
  const verificationBodiesService: MockType<VerificationBodiesService> = mockClass(VerificationBodiesService);

  class Page extends BasePage<EditComponent> {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditComponent],
      providers: [
        { provide: VerificationBodiesService, useValue: verificationBodiesService },
        { provide: VerifierAuthoritiesService, useValue: mockClass(VerifierAuthoritiesService) },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: CountryService, useClass: CountryServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  afterEach(() => vi.clearAllMocks());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct page heading', () => {
    expect(page.heading1.textContent.trim()).toBe('Edit verification body details');
  });

  it('should show error summary when form is submitted without required fields', () => {
    expect(page.errorSummary).toBeNull();

    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).not.toBeNull();
  });

  it('should navigate to parent route when form is pristine', () => {
    const navigateSpy = vi.spyOn((component as any).router, 'navigate').mockResolvedValue(true);

    component.handleFormSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['../'], { relativeTo: activatedRoute });
  });

  it('should call updateVerificationBodyDetails and navigate when form is dirty', () => {
    verificationBodiesService.updateVerificationBody.mockReturnValue(of(null as any));
    component.form.markAsDirty();

    const navigateSpy = vi.spyOn((component as any).router, 'navigate').mockResolvedValue(true);

    component.handleFormSubmit();

    expect(verificationBodiesService.updateVerificationBody).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['../'], { relativeTo: activatedRoute });
  });
});
