import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';

import { ActivatedRouteStub } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import {
  initialReturnToOperatorForChangesState,
  ReturnToOperatorForChangesStore,
} from '@requests/tasks/aer-verification-submit/return-to-operator-for-changes/+state';
import { ReturnToOperatorForChangesFormComponent } from '@requests/tasks/aer-verification-submit/return-to-operator-for-changes/return-to-operator-for-changes-form/return-to-operator-for-changes-form.component';

describe('ReturnToOperatorForChangesFormComponent', () => {
  let component: ReturnToOperatorForChangesFormComponent;
  let fixture: ComponentFixture<ReturnToOperatorForChangesFormComponent>;
  let router: Router;
  let store: ReturnToOperatorForChangesStore;
  const route = new ActivatedRouteStub();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnToOperatorForChangesFormComponent],
      providers: [{ provide: ActivatedRoute, useValue: route }, ...taskProviders],
    }).compileComponents();

    store = TestBed.inject(ReturnToOperatorForChangesStore);
    router = TestBed.inject(Router);
    route.setUrl([new UrlSegment('/', {})]);
    fixture = TestBed.createComponent(ReturnToOperatorForChangesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not proceed to summary if form is empty', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    fixture.detectChanges();

    expect(component.form.invalid).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();

    const errorSummary = fixture.debugElement.query(By.css('.govuk-error-summary'));
    expect(errorSummary).toBeTruthy();

    const errorMessages = errorSummary.queryAll(By.css('a'));
    expect(errorMessages.some((message) => message.nativeElement.text.trim() === 'Enter the changes required')).toEqual(
      true,
    );

    expect(store.state).toEqual(initialReturnToOperatorForChangesState);
  });

  it('should proceed to summary if form filled correctly', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({
      changesRequired: 'test entry',
    });
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    fixture.detectChanges();

    expect(component.form.valid).toBe(true);

    const errorSummary = fixture.debugElement.query(By.css('.govuk-error-summary'));
    expect(errorSummary).toBeFalsy();

    expect(store.state).toEqual({
      changesRequired: 'test entry',
      isSubmitted: false,
    });

    expect(navigateSpy).toHaveBeenCalledWith(['summary'], { relativeTo: route });
  });
});
