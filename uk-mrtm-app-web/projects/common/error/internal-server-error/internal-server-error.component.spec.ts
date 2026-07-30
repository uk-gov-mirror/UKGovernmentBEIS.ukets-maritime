import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { GenericServiceErrorCode } from '../service-errors';
import { InternalServerErrorComponent } from './internal-server-error.component';

describe('InternalServerErrorComponent', () => {
  let component: InternalServerErrorComponent;
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'error', component: InternalServerErrorComponent }])],
    });
    router = TestBed.inject(Router);
  });

  describe('for default error', () => {
    beforeEach(async () => {
      harness = await RouterTestingHarness.create();
      component = await harness.navigateByUrl('/error', InternalServerErrorComponent);
      harness.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTML elements', () => {
      const element: HTMLElement = harness.routeNativeElement;
      const paragraphContents = Array.from(element.querySelectorAll<HTMLParagraphElement>('p')).map((el) =>
        el.textContent.trim(),
      );

      expect(element.querySelector('h1').textContent).toEqual('Sorry, there is a problem with the service');
      expect(paragraphContents).toEqual(['Try again later.', 'Contact the DESNZ helpdesk if you have any questions.']);
      expect(element.querySelector('a').href).toEqual('http://localhost:3000/contact-us');
    });
  });

  describe('for custom errors', () => {
    const errorCode = GenericServiceErrorCode.INTREGACCOUNTCREATIONMRTM1007;

    beforeEach(async () => {
      harness = await RouterTestingHarness.create();
      await router.navigate(['/error'], { state: { errorCode } });
      component = await harness.fixture.debugElement.query(
        (el) => el.componentInstance instanceof InternalServerErrorComponent,
      )?.componentInstance;
      harness.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTML elements', () => {
      const element: HTMLElement = harness.routeNativeElement;
      const paragraphContents = Array.from(element.querySelectorAll<HTMLParagraphElement>('p')).map((el) =>
        el.textContent.trim(),
      );

      expect(element.querySelector('h1').textContent).toEqual(
        'Sorry, the service could not send information to the registry',
      );
      expect(paragraphContents).toEqual([
        "We're experiencing temporary difficulties in syncing data.",
        'Try again later.',
        'Contact UK ETS reporting helpdesk for assistance.',
      ]);
      expect(element.querySelector('a').href).toEqual('mailto:METS@energysecurity.gov.uk');
    });
  });
});
