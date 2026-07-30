import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params, provideRouter, Router } from '@angular/router';

import { FeedbackBannerStore } from '@netz/common/components';
import { BasePage } from '@netz/common/testing';

import { AccountsListFiltersComponent } from '@accounts/components/accounts-list-filters/accounts-list-filters.component';

describe('AccountsListFiltersComponent', () => {
  let component: AccountsListFiltersComponent;
  let fixture: ComponentFixture<AccountsListFiltersComponent>;
  let page: Page;
  let router: Router;
  let feedbackBannerStore: FeedbackBannerStore;

  class Page extends BasePage<AccountsListFiltersComponent> {
    get submitButton() {
      return this.query<HTMLButtonElement>('button[type="submit"]');
    }

    get clearFiltersLink() {
      return this.query<HTMLAnchorElement>('a[type="reset"]');
    }
  }

  const setup = async (queryParams: Params = {}) => {
    const activatedRoute = { snapshot: { queryParams } };

    await TestBed.configureTestingModule({
      imports: [AccountsListFiltersComponent],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: activatedRoute }],
    }).compileComponents();

    feedbackBannerStore = TestBed.inject(FeedbackBannerStore);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(AccountsListFiltersComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  };

  describe('default state (no query params)', () => {
    beforeEach(async () => setup());

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize the form with null values when no query params are present', () => {
      expect(component.formGroup.value).toEqual({ term: null, status: null, contactEmail: null });
    });

    it('should register the formGroup with the notification banner store on init', () => {
      expect(feedbackBannerStore.state.invalidForm).toBe(component.formGroup);
    });

    it('should render the search submit button', () => {
      expect(page.submitButton).not.toBeNull();
      expect(page.submitButton.textContent?.trim()).toBe('Search');
    });

    it('should not show the clear-filters link when no filters are applied', () => {
      expect(page.clearFiltersLink).toBeNull();
    });
  });

  describe('hasAppliedFilters', () => {
    beforeEach(async () => setup());

    it('should be false when all form values are null', () => {
      expect((component as any).hasAppliedFilters()).toBe(false);
    });

    it('should be true when term has a value', () => {
      component.formGroup.controls.term.setValue('test');

      expect((component as any).hasAppliedFilters()).toBe(true);
    });

    it('should be true when status has a value', () => {
      component.formGroup.controls.status.setValue('NEW');

      expect((component as any).hasAppliedFilters()).toBe(true);
    });

    it('should be true when contactEmail has a value', () => {
      component.formGroup.controls.contactEmail.setValue('John Doe');

      expect((component as any).hasAppliedFilters()).toBe(true);
    });

    it('should be false when all values are whitespace-only', () => {
      component.formGroup.controls.term.setValue('   ');

      expect((component as any).hasAppliedFilters()).toBe(false);
    });

    it('should show the clear-filters link when a filter is applied', () => {
      component.formGroup.controls.term.setValue('test');
      fixture.detectChanges();

      expect(page.clearFiltersLink).not.toBeNull();
    });

    it('should hide the clear-filters link after filters are cleared', () => {
      component.formGroup.controls.term.setValue('test');
      fixture.detectChanges();

      component.formGroup.controls.term.setValue(null);
      fixture.detectChanges();

      expect(page.clearFiltersLink).toBeNull();
    });
  });

  describe('onSubmit', () => {
    beforeEach(async () => setup());

    it('should not navigate when the form is invalid', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.formGroup.controls.term.setValue('ab'); // below minLength(3)

      component.onSubmit();

      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should navigate with the correct query params when the form is valid', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.formGroup.controls.term.setValue('searchterm');

      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(
        ['.'],
        expect.objectContaining({
          relativeTo: expect.anything(),
          queryParams: expect.objectContaining({ term: 'searchterm', page: null }),
          queryParamsHandling: 'merge',
        }),
      );
    });

    it('should trim whitespace from term before navigating', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.formGroup.controls.term.setValue('  trimmed  ');

      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(
        ['.'],
        expect.objectContaining({ queryParams: expect.objectContaining({ term: 'trimmed' }) }),
      );
    });

    it('should convert a null term to null in query params', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.formGroup.controls.term.setValue(null);
      component.formGroup.controls.status.setValue('LIVE');

      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(
        ['.'],
        expect.objectContaining({ queryParams: expect.objectContaining({ term: null, status: 'LIVE' }) }),
      );
    });

    it('should convert a whitespace-only term to null in query params', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.formGroup.controls.term.setValue('   ');

      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(
        ['.'],
        expect.objectContaining({ queryParams: expect.objectContaining({ term: null }) }),
      );
    });

    it('should always include page: null to reset pagination on search', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.formGroup.controls.term.setValue('term');

      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(
        ['.'],
        expect.objectContaining({ queryParams: expect.objectContaining({ page: null }) }),
      );
    });
  });

  describe('pre-populated from query params', () => {
    beforeEach(async () => setup({ term: 'search-term', status: 'NEW', contactEmail: 'John' }));

    it('should initialise form controls from all provided query params', () => {
      expect(component.formGroup.value).toEqual({
        term: 'search-term',
        status: 'NEW',
        contactEmail: 'John',
      });
    });

    it('should report hasAppliedFilters as true when query params populate the form', () => {
      expect((component as any).hasAppliedFilters()).toBe(true);
    });

    it('should show the clear-filters link when filters are pre-populated', () => {
      expect(page.clearFiltersLink).not.toBeNull();
    });
  });

  describe('partially pre-populated from query params', () => {
    beforeEach(async () => setup({ term: 'test' }));

    it('should set term from query params and leave other fields null', () => {
      expect(component.formGroup.value).toEqual({ term: 'test', status: null, contactEmail: null });
    });

    it('should show the clear-filters link for partial filters', () => {
      expect(page.clearFiltersLink).not.toBeNull();
    });
  });
});
