import {
  Component,
  computed,
  contentChild,
  ElementRef,
  input,
  OnInit,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { takeUntil } from 'rxjs';

import {
  ErrorMessageComponent,
  FormInput,
  GovukWidthClass,
  LabelDirective,
  LabelSizeType,
  SafeHtmlPipe,
} from '@netz/govuk-components';

import { AutocompleteSelectOption } from '@shared/components/autocomplete-select/autocomplete-select.interface';
import { AutocompleteSelectInputScrollSyncDirective } from '@shared/components/autocomplete-select/autocomplete-select-input-scroll-sync.directive';
import { isEqual } from '@shared/utils';

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
@Component({
  selector: 'div[mrtm-autocomplete-select]',
  imports: [ReactiveFormsModule, ErrorMessageComponent, AutocompleteSelectInputScrollSyncDirective, SafeHtmlPipe],
  standalone: true,
  templateUrl: './autocomplete-select.component.html',
  styleUrl: './autocomplete-select.component.scss',
})
export class AutocompleteSelectComponent extends FormInput implements OnInit {
  readonly label = input<string>('');
  readonly labelSize = input<LabelSizeType>();
  readonly isLabelHidden = input<boolean>(false);
  readonly hint = input<string>();
  readonly options = input.required<AutocompleteSelectOption[]>();
  readonly widthClass = input<GovukWidthClass>();

  /**
   * When the user clicks outside of the component the autocomplete will try to select the currently highlighted
   * option (markedIndex) if there is one. Set `autoselectOnBlur` to true to enable this behaviour.
   */
  readonly autoselectOnBlur = input<boolean>(false);

  // the minimum number of characters that should be entered before the autocomplete will attempt to suggest options
  readonly minLength = input<number>(0);

  /**
   * When in typeahead mode the first option is 'marked for selection' when the user types in something
   * and receives results. Pressing enter will select the highlighted option.
   * The user will see a typing suggestion in the input field if the query is not empty and it matches
   * the start of the highlighted `option.text`.
   */
  readonly typeaheadMode = input<boolean>(true);

  /**
   * Sets type attribute of queryInput field. If the input is set to type="search" most browsers will
   * display a button (X) and bind Escape key for clearing the input text.
   */
  readonly inputFieldType = input<'text' | 'search'>('text');

  // if `showAllValues` is set to true, all values are shown when the user clicks the input
  readonly showAllValues = input<boolean>(true);

  // the dropdown will show a "No results found" template when there are no results
  readonly showNoOptionsFound = input<boolean>(true);
  readonly noOptionsFoundText = input<string>('No results found');

  readonly queryInputRef = viewChild<ElementRef<HTMLInputElement>>('queryInput');
  readonly templateLabel = contentChild(LabelDirective);
  private readonly listboxRef = viewChild<ElementRef<HTMLElement>>('listbox');
  private readonly optionsRef = viewChildren<ElementRef<HTMLElement>>('option');

  readonly labelSizeClasses = computed<string>(() => {
    switch (this.labelSize()) {
      case 'small':
        return 'govuk-label govuk-label--s';
      case 'medium':
        return 'govuk-label govuk-label--m';
      case 'large':
        return 'govuk-label govuk-label--l';
      default:
        return 'govuk-label';
    }
  });

  readonly isMenuOpen = signal(false);

  /**
   * Index tracking signals store what is focused, hovered and "marked for selection":
   * 0-based index points to the option that is currently focused/hovered/marked
   * -1 means the input field is focused/marked
   * null means nothing in the component is focused/hovered/marked
   *
   * `focusedIndex` is used to track where the focus is for keyboard navigation
   * `markedIndex` is used to highlight the option that would be selected if user pressed Enter or Space
   * `focusedIndex` and `markedIndex` diverge only in typeaheadMode when user types in the input
   * and the first option is marked for selection but the input remains focused
   *
   * `hoveredIndex` is used to highlight the option that user is hovering with mouse and it takes precedence
   * over `focusedIndex`/`markedIndex` for styling purposes when it is not null (e.g. when user hovers an option with mouse)
   */
  readonly focusedIndex = signal<number>(null);
  readonly hoveredIndex = signal<number>(null);
  readonly markedIndex = signal<number>(null);

  readonly queryControl = new FormControl<string>('');
  private readonly queryString = signal<string>('');
  private readonly hasMinQueryLength = computed<boolean>(() => this.queryString().length >= this.minLength());

  readonly filteredOptions = computed<AutocompleteSelectOption[]>(() => {
    const query = this.queryString()?.toLowerCase();

    if (this.hasMinQueryLength()) {
      if (query) {
        return this.options().filter((option) => option.text.toLowerCase().includes(query));
      } else if (this.showAllValues()) {
        return this.options();
      }
    }

    return [];
  });

  readonly typeaheadSuggestion = computed<string>(() => {
    if (
      !this.typeaheadMode() ||
      !this.isMenuOpen() ||
      this.filteredOptions().length === 0 ||
      !this.isIndexOnOption(this.markedIndex()) ||
      this.queryString() === ''
    ) {
      return null;
    }
    const markedOption = this.filteredOptions()[this.markedIndex()];
    const optionMatchesQueryString = markedOption.text.toLowerCase().startsWith(this.queryString().toLowerCase());
    return optionMatchesQueryString ? this.queryString() + markedOption.text.substring(this.queryString().length) : '';
  });

  readonly showNoOptionsText = computed<boolean>(() => {
    const hasOptions = !!this.options().length;
    const hasQueryString = !!this.queryString();
    return (
      this.showNoOptionsFound() &&
      (this.showAllValues() || (hasQueryString && this.hasMinQueryLength())) &&
      (hasOptions || hasQueryString)
    );
  });

  constructor() {
    super();
  }

  writeValue(value: AutocompleteSelectOption) {
    this.quietlySetQueryControlValue(value?.text);
  }

  registerOnChange() {}

  registerOnTouched() {}

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.queryControl.disable() : this.queryControl.enable();
  }

  override ngOnInit() {
    super.ngOnInit();

    this.queryControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((queryControlValue) => {
      this.queryString.set(queryControlValue);
      const data = this.findOptionFromText(queryControlValue)?.data ?? null;
      this.setControlValue({ data, text: queryControlValue });
    });
  }

  handleLabelClick(event: Event) {
    /**
     * Prevents the default label click behaviour of triggering a click event
     * on the associated input field which could (re)open the menu. Manually
     * focuses the input field instead to allow for better control of the
     * menu open/close logic.
     */
    event.preventDefault();
    this.queryInputRef().nativeElement.focus();
  }

  handleInputFieldInput() {
    this.openMenu();
  }

  handleInputFocus() {
    const componentGainedFocus = this.focusedIndex() === null;
    if (componentGainedFocus) {
      // selects all text in input when it first gains focus
      this.queryInputRef().nativeElement.select();
      this.focusedIndex.set(-1);
    }
  }

  handleInputBlur(event: FocusEvent) {
    const focusingAnOption = this.isIndexOnOption(this.focusedIndex());
    const focusingListbox = event.relatedTarget === this.listboxRef()?.nativeElement;
    if (!(focusingAnOption || focusingListbox)) {
      this.blurComponent();
    }
  }

  handleListboxBlur(event: FocusEvent) {
    const focusingAnOption = this.isIndexOnOption(this.focusedIndex());
    const focusingQueryInput = event.relatedTarget === this.queryInputRef()?.nativeElement;
    if (!(focusingAnOption || focusingQueryInput)) {
      this.blurComponent();
    }
  }

  handleInputClick() {
    // opens menu when clicking the input even if the input already has focus
    this.openMenu();
  }

  handleUpArrow(event: KeyboardEvent) {
    event.preventDefault();
    if (this.isMenuOpen()) {
      const isNotAtTop = this.isMenuOpen() && this.isIndexOnOption(this.markedIndex());
      if (isNotAtTop) {
        this.navigateToElement(this.markedIndex() - 1);
      }
    } else {
      this.openMenu();
    }
  }

  handleDownArrow(event: KeyboardEvent) {
    event.preventDefault();
    if (this.isMenuOpen()) {
      const isNotAtBottom = this.markedIndex() !== this.filteredOptions().length - 1;
      if (isNotAtBottom) {
        this.navigateToElement(this.markedIndex() + 1);
      }
    } else {
      this.openMenu();
    }
  }

  handleSpace(event: KeyboardEvent) {
    if (this.isMenuOpen()) {
      // if the focus is on the input field do nothing (allow typing in Space)
      // if the focus is on an option, select that option
      const focusIsOnOption = this.isIndexOnOption(this.focusedIndex());
      if (focusIsOnOption) {
        event.preventDefault();
        this.selectOptionFromIndex(this.focusedIndex());
        this.closeMenu(-1);
      }
    } else {
      event.preventDefault();
      this.openMenu();
    }
  }

  handleEnter(event: KeyboardEvent) {
    if (this.isMenuOpen()) {
      event.preventDefault();
      const optionIsMarked = this.isIndexOnOption(this.markedIndex());
      if (optionIsMarked) {
        this.selectOptionFromIndex(this.markedIndex());
        this.closeMenu(-1);
      }
    }
  }

  handlePrintableKey(event: KeyboardEvent) {
    const eventIsOnInput = event.target === this.queryInputRef().nativeElement;
    if (!eventIsOnInput) {
      this.queryInputRef().nativeElement.focus();
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    switch (event.code) {
      case 'ArrowUp':
        this.handleUpArrow(event);
        break;
      case 'ArrowDown':
        this.handleDownArrow(event);
        break;
      case 'Space':
        this.handleSpace(event);
        break;
      case 'Enter':
        this.handleEnter(event);
        break;
      case 'Escape':
        this.blurComponent();
        break;
      default:
        if (this.isPrintableKey(event)) {
          this.handlePrintableKey(event);
        }
        break;
    }
  }

  handleListMouseLeave() {
    this.hoveredIndex.set(null);
  }

  handleOptionClick(index: number) {
    this.selectOptionFromIndex(index);
    this.closeMenu(-1);
  }

  handleOptionMouseEnter(index) {
    this.hoveredIndex.set(index);
  }

  handleOptionMouseDown(event) {
    // Safari triggers focusOut before click, but if you preventDefault on mouseDown, you can stop that from happening.
    // If this is removed, clicking on an option in Safari will close the menu, and the click will trigger on the element
    // underneath instead.
    // See: http://stackoverflow.com/questions/7621711/how-to-prevent-blur-running-when-clicking-a-link-in-jquery
    event.preventDefault();
  }

  handleOptionBlur(event, index) {
    const focusingOutsideComponent = event.relatedTarget === null;
    const focusingInput = event.relatedTarget === this.queryInputRef().nativeElement;
    const focusingAnotherOption = this.focusedIndex() !== index && this.focusedIndex() !== -1;
    const shouldBlurComponent =
      (!focusingAnotherOption && focusingOutsideComponent) || !(focusingAnotherOption || focusingInput);
    if (shouldBlurComponent) {
      this.blurComponent();
    }
  }

  private blurComponent() {
    const queryMatchingOption = this.findOptionFromText(this.queryString());

    if (queryMatchingOption) {
      /**
       * Autoselects an option if the queryString matches `text` of a valid option.
       * It will autocorrect queryString case if different from `option.text`.
       */
      if (!isEqual(this.control.value, queryMatchingOption)) {
        this.setControlValue(queryMatchingOption);
      }
    } else if (this.autoselectOnBlur()) {
      const isIndexOnOption = this.isIndexOnOption(this.markedIndex());

      if (isIndexOnOption) {
        // autoselect the marked option
        this.selectOptionFromIndex(this.markedIndex());
      }
    }

    this.closeMenu(null);
  }

  private setControlValue(option: AutocompleteSelectOption) {
    this.control.setValue(option);
    this.control.markAsDirty();
    this.control.markAsTouched();
  }

  private quietlySetQueryControlValue(queryString: string) {
    this.queryControl.setValue(queryString ?? '', { emitEvent: false });
    this.queryString.set(queryString ?? '');
  }

  private selectOptionFromIndex(index: number) {
    const selectedOption = this.filteredOptions()?.[index];
    this.setControlValue(selectedOption);
  }

  private navigateToElement(index) {
    this.focusedIndex.set(index);
    this.markedIndex.set(index);
    this.hoveredIndex.set(null);

    const shouldFocusInput = index === -1;
    if (shouldFocusInput) {
      this.queryInputRef()?.nativeElement?.focus();
    } else {
      this.optionsRef()?.[index]?.nativeElement?.focus();
    }
  }

  private openMenu() {
    const shouldOpenMenu = this.hasMinQueryLength() && (this.filteredOptions().length > 0 || this.showNoOptionsFound());

    if (shouldOpenMenu) {
      this.isMenuOpen.set(shouldOpenMenu);
    }

    const shouldMarkFirstOption = this.typeaheadMode() && shouldOpenMenu;
    this.focusedIndex.set(-1);
    this.markedIndex.set(shouldMarkFirstOption ? 0 : -1);
  }

  private closeMenu(index: -1 | null) {
    this.isMenuOpen.set(false);
    this.focusedIndex.set(index);
    this.markedIndex.set(index);
    this.hoveredIndex.set(null);

    const shouldFocusInput = index === -1;
    if (shouldFocusInput) {
      this.queryInputRef().nativeElement.focus();
    }
  }

  private findOptionFromText(text: AutocompleteSelectOption['text']): AutocompleteSelectOption | undefined {
    return this.options().find((option) => option.text.toLowerCase() === text.toLowerCase().trim());
  }

  private isPrintableKey(event: KeyboardEvent): boolean {
    return event.key.length === 1 || event.key === 'Backspace' || event.key === ' ';
  }

  private isIndexOnOption(index: number): boolean {
    return index !== null && index !== undefined && index >= 0 && this.filteredOptions().length > index;
  }
}
