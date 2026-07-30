import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlContainer, FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { GovukValidators, LabelSizeType } from '@netz/govuk-components';

import { AutocompleteSelectComponent } from '@shared/components/autocomplete-select/autocomplete-select.component';
import { AutocompleteSelectOption } from '@shared/components/autocomplete-select/autocomplete-select.interface';

describe('AutocompleteSelectComponent', () => {
  @Component({
    imports: [AutocompleteSelectComponent, ReactiveFormsModule],
    standalone: true,
    template: `
      <div
        mrtm-autocomplete-select
        [formControl]="control"
        [options]="countryOptions()"
        label="Select or type to filter"
        [labelSize]="labelSize()"
        [typeaheadMode]="typeaheadMode()"
        [autoselectOnBlur]="autoselectOnBlur()"
        [minLength]="minLength()"></div>
    `,
  })
  class TestComponent {
    control = new FormControl();
    readonly countryOptions = signal<AutocompleteSelectOption[]>(COUNTRY_OPTIONS);
    readonly labelSize = signal<LabelSizeType>(undefined);
    readonly minLength = signal<number>(0);
    readonly typeaheadMode = signal<boolean>(true);
    readonly autoselectOnBlur = signal<boolean>(false);
  }

  let component: AutocompleteSelectComponent;
  let hostComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;
  let queryInput: HTMLInputElement;
  let keydownBoundWrapper: HTMLDivElement;

  const COUNTRY_OPTIONS: AutocompleteSelectOption[] = [
    { text: 'Croatia', data: 'HR' },
    { text: 'Dominica', data: 'DO' },
    { text: 'Dominican Republic', data: 'DR' },
    { text: 'Germany', data: 'DE' },
    { text: 'Greece', data: 'GR' },
    { text: 'Poland', data: 'PL' },
    { text: 'United Kingdom', data: 'UK' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ControlContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    hostComponent = fixture.componentInstance;
    element = fixture.nativeElement;
    component = fixture.debugElement.query(By.directive(AutocompleteSelectComponent)).componentInstance;
    fixture.detectChanges();
    queryInput = element.querySelector<HTMLInputElement>('input.autocomplete-select__input');
    keydownBoundWrapper = element.querySelector('.autocomplete-select__wrapper');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display labelSize classes', () => {
    const hostElement: HTMLElement = fixture.nativeElement;
    const label = hostElement.querySelector('label');
    const baseCssClasses = 'autocomplete-select__label govuk-label';

    expect(label.className).toEqual(baseCssClasses);

    hostComponent.labelSize.set('normal');
    fixture.detectChanges();
    expect(label.className).toEqual(baseCssClasses);

    hostComponent.labelSize.set('small');
    fixture.detectChanges();
    expect(label.className).toEqual(baseCssClasses + ' govuk-label--s');

    hostComponent.labelSize.set('medium');
    fixture.detectChanges();
    expect(label.className).toEqual(baseCssClasses + ' govuk-label--m');

    hostComponent.labelSize.set('large');
    fixture.detectChanges();
    expect(label.className).toEqual(baseCssClasses + ' govuk-label--l');
  });

  describe('queryInput field interaction', () => {
    it('should filter options based on input', () => {
      queryInput.value = 'dom';
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const options = element.querySelectorAll('.autocomplete-select__option');
      // Should show Dominica, Dominican Republic, United Kingdom
      expect(options.length).toBe(3);
      expect(options[0].textContent.trim()).toBe('Dominica');
      expect(options[1].textContent.trim()).toBe('Dominican Republic');
      expect(options[2].textContent.trim()).toBe('United Kingdom');
    });

    it('should show "No results found" when no matches exist', () => {
      queryInput.value = 'xyz';
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const noResults = element.querySelector('.autocomplete-select__option--no-results');
      expect(noResults.textContent.trim()).toBe(component.noOptionsFoundText());
    });

    it('should not show "No results found" when no options exist and queryInput is empty', () => {
      hostComponent.countryOptions.set([]);
      queryInput.value = '';
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const options = element.querySelectorAll('.autocomplete-select__option');
      expect(options.length).toBe(0);

      const noResults = element.querySelector('.autocomplete-select__option--no-results');
      expect(noResults).toBeFalsy();
    });

    it('should not show options if input length is less than minLength', () => {
      hostComponent.minLength.set(3);
      queryInput.value = 'Do';
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const options = element.querySelectorAll(
        '.autocomplete-select__option:not(.autocomplete-select__option--no-results)',
      );
      expect(options.length).toBe(0);
    });
  });

  describe('keyboard navigation', () => {
    it('should open the menu and filter the options on (input) event', () => {
      expect(component.isMenuOpen()).toBe(false);

      queryInput.value = 'G';
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const options = [];
      element
        .querySelectorAll('.autocomplete-select__option')
        .forEach((option) => options.push(option.textContent.trim()));

      expect(component.isMenuOpen()).toBe(true);
      expect(options.length).toBe(3);
      expect(options).toEqual(['Germany', 'Greece', 'United Kingdom']);
    });

    it('should navigate options with arrow keys', () => {
      const options = element.querySelectorAll('.autocomplete-select__option');
      const upEvent = new KeyboardEvent('keydown', { code: 'ArrowUp' });
      const downEvent = new KeyboardEvent('keydown', { code: 'ArrowDown' });

      // should open the listbox and automatically mark the first option
      keydownBoundWrapper.dispatchEvent(downEvent);
      fixture.detectChanges();
      expect(component.markedIndex()).toBe(0);

      // should navigate to the second option
      keydownBoundWrapper.dispatchEvent(downEvent);
      fixture.detectChanges();
      expect(component.markedIndex()).toBe(1);

      // should navigate back to the first option
      keydownBoundWrapper.dispatchEvent(upEvent);
      fixture.detectChanges();
      expect(component.markedIndex()).toBe(0);

      // should navigate to the input field with ArrowUp
      keydownBoundWrapper.dispatchEvent(upEvent);
      fixture.detectChanges();
      expect(component.markedIndex()).toBe(-1);

      // should stay at the input field if ArrowUp is pressed again
      keydownBoundWrapper.dispatchEvent(upEvent);
      fixture.detectChanges();
      expect(component.markedIndex()).toBe(-1);

      // should navigate to the last option
      options.forEach(() => keydownBoundWrapper.dispatchEvent(downEvent));
      fixture.detectChanges();
      expect(component.markedIndex()).toBe(options.length - 1);

      // should stay on the last option if ArrowDown is pressed again
      keydownBoundWrapper.dispatchEvent(downEvent);
      fixture.detectChanges();
      expect(component.markedIndex()).toBe(options.length - 1);
    });

    it('should select option with Enter key', () => {
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const enterEvent = new KeyboardEvent('keydown', { code: 'Enter' });
      keydownBoundWrapper.dispatchEvent(enterEvent);
      fixture.detectChanges();

      expect(hostComponent.control.value).toEqual({ data: 'HR', text: 'Croatia' });
      expect(queryInput.value).toBe('Croatia');
    });

    it('should close menu with Escape key', () => {
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.isMenuOpen()).toBe(true);

      const escapeEvent = new KeyboardEvent('keydown', { code: 'Escape' });
      keydownBoundWrapper.dispatchEvent(escapeEvent);
      fixture.detectChanges();

      expect(component.isMenuOpen()).toBe(false);
    });
  });

  describe('pointer interaction', () => {
    beforeEach(() => {
      queryInput.value = 'gr';
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    });

    it('should track hovered option in hoveredIndex', () => {
      const firstOption = element.querySelector('.autocomplete-select__option');
      firstOption.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();

      expect(component.hoveredIndex()).toBe(0);
    });

    it('should select option on click', () => {
      const firstOption = element.querySelector<HTMLElement>('.autocomplete-select__option');
      firstOption.click();
      fixture.detectChanges();

      expect(hostComponent.control.value).toEqual({ data: 'GR', text: 'Greece' });
      expect(queryInput.value).toBe('Greece');
    });

    it('should clear hoveredIndex when mouse leaves menu', () => {
      const menu = element.querySelector('.autocomplete-select__menu');
      menu.dispatchEvent(new MouseEvent('mouseleave'));
      fixture.detectChanges();

      expect(component.hoveredIndex()).toBeNull();
    });
  });

  describe('On component blur', () => {
    it('should set form control to null option when input is cleared', () => {
      const option = COUNTRY_OPTIONS[5];
      hostComponent.control.setValue(option);
      fixture.detectChanges();

      expect(queryInput.value).toEqual(option.text);
      queryInput.value = '';
      queryInput.dispatchEvent(new Event('input'));
      queryInput.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(hostComponent.control.value).toEqual({ data: null, text: '' });
      expect(queryInput.value).toBe('');
    });

    it('should autoselect when typed-in query value completely matches a valid option.text (case-insensitive)', () => {
      expect(hostComponent.control.value).toBe(null);

      // start with an empty input
      queryInput.value = 'poland';
      queryInput.dispatchEvent(new Event('input'));
      queryInput.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(hostComponent.control.value).toEqual({ data: 'PL', text: 'Poland' });

      // start with a valid value in the input
      queryInput.value = 'greece';
      queryInput.dispatchEvent(new Event('input'));
      queryInput.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(hostComponent.control.value).toEqual({ data: 'GR', text: 'Greece' });
    });

    it('should set form control to null if input string does not match a valid option', () => {
      const testResetting = () => {
        queryInput.value = 'abcd';
        queryInput.dispatchEvent(new Event('input'));
        queryInput.dispatchEvent(new Event('blur'));
        fixture.detectChanges();

        expect(hostComponent.control.value).toEqual({ data: null, text: 'abcd' });
        // should leave input string as is
        expect(queryInput.value).toBe('abcd');
      };

      // start with an empty input
      testResetting();

      // start with a valid value in the input
      const option = COUNTRY_OPTIONS[5];
      hostComponent.control.setValue(option);
      fixture.detectChanges();

      testResetting();
    });

    it('should autoselect the highlighted option if autoselectOnBlur is enabled and queryInput is not empty', () => {
      const downEvent = new KeyboardEvent('keydown', { code: 'ArrowDown' });

      hostComponent.autoselectOnBlur.set(true);
      fixture.detectChanges();

      // should open the listbox on (input) and automatically mark the first option
      queryInput.value = 'g';
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      keydownBoundWrapper.dispatchEvent(downEvent);
      fixture.detectChanges();

      const expectedOptionIndex = 1;
      expect(component.markedIndex()).toBe(expectedOptionIndex);

      const markedOption = element.querySelectorAll<HTMLElement>('.autocomplete-select__option');
      markedOption[expectedOptionIndex].dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(hostComponent.control.value).toEqual({ data: 'GR', text: 'Greece' });
      expect(queryInput.value).toBe('Greece');
    });
  });

  describe('Typeahead behavior', () => {
    it('should show typeahead suggestion for matching option when typeahead mode is enabled', () => {
      hostComponent.typeaheadMode.set(true);
      fixture.detectChanges();

      queryInput.value = 'Gre';
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const suggestion = element.querySelector<HTMLInputElement>('.autocomplete-select__typeahead-suggestion');
      expect(suggestion.value).toBe('Greece');
    });

    it('should not show typeahead suggestion for matching option when typeahead mode is disabled', () => {
      hostComponent.typeaheadMode.set(false);
      fixture.detectChanges();

      queryInput.value = 'Gre';
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const suggestion = element.querySelector<HTMLInputElement>('.autocomplete-select__typeahead-suggestion');
      expect(suggestion).toBeFalsy();
    });

    it('should automatically mark-for-selection first option when typeahead mode is enabled', () => {
      hostComponent.typeaheadMode.set(true);
      fixture.detectChanges();

      queryInput.value = 'G';
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.markedIndex()).toBe(0);
    });

    it('should not automatically mark-for-selection first option when typeahead mode is disabled', () => {
      hostComponent.typeaheadMode.set(false);
      fixture.detectChanges();

      queryInput.value = 'G';
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.markedIndex()).toBe(-1);
    });
  });

  describe('Form integration', () => {
    it('should assign value', async () => {
      const option = COUNTRY_OPTIONS[0];
      hostComponent.control.patchValue(option);
      fixture.detectChanges();

      expect(hostComponent.control.valid).toBeTruthy();
      expect(queryInput.value).toEqual(option.text);
    });

    it('should disable the input', async () => {
      hostComponent.control.disable();
      fixture.detectChanges();

      expect(queryInput.disabled).toBeTruthy();
    });

    it('should apply validators', () => {
      hostComponent.control.clearValidators();
      hostComponent.control.setValidators(GovukValidators.required('Select an option'));
      hostComponent.control.updateValueAndValidity();
      fixture.detectChanges();

      const errorMessage = element.querySelector('.govuk-error-message');
      expect(errorMessage.textContent.trim()).toEqual('Error: Select an option');
    });

    it('should update form control when an option is selected', () => {
      const option = COUNTRY_OPTIONS[0];
      hostComponent.control.patchValue(option.data);
      fixture.detectChanges();

      queryInput.value = 'uni';
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const firstOptionEl = element.querySelector<HTMLElement>('.autocomplete-select__option');
      firstOptionEl.click();
      fixture.detectChanges();

      expect(queryInput.value).toBe('United Kingdom');
      expect(hostComponent.control.value).toEqual({ data: 'UK', text: 'United Kingdom' });
      expect(hostComponent.control.valid).toBe(true);
    });
  });

  describe('Accessibility ARIA attributes', () => {
    it('should have correct ARIA attributes', () => {
      expect(queryInput.getAttribute('role')).toBe('combobox');
      expect(queryInput.getAttribute('aria-autocomplete')).toBe('list');
      expect(queryInput.getAttribute('aria-expanded')).toBe('false');

      queryInput.value = 'G';
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(queryInput.getAttribute('aria-expanded')).toBe('true');
      expect(queryInput.getAttribute('aria-activedescendant')).toContain('option--0');
    });

    it('should update aria-activedescendant when navigating options', () => {
      const downEvent = new KeyboardEvent('keydown', { code: 'ArrowDown' });

      queryInput.value = 'G';
      queryInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(queryInput.getAttribute('aria-activedescendant')).toContain('option--0');

      keydownBoundWrapper.dispatchEvent(downEvent);
      fixture.detectChanges();
      expect(queryInput.getAttribute('aria-activedescendant')).toContain('option--1');

      keydownBoundWrapper.dispatchEvent(downEvent);
      fixture.detectChanges();
      expect(queryInput.getAttribute('aria-activedescendant')).toContain('option--2');
    });
  });
});
