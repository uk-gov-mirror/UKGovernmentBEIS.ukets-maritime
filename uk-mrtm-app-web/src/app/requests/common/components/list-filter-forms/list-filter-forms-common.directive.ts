import {
  AfterViewInit,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  output,
  Signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { FeedbackBannerStore } from '@netz/common/components';

import { AutocompleteSelectOption, AutocompleteSelectValidators } from '@shared/components/autocomplete-select';
import { ShipEmissionTableListItem } from '@shared/types';
import { isEqual, isNil } from '@shared/utils';

export const ALL_SHIPS_VALUE: AutocompleteSelectOption = { text: '', data: null };

@Directive()
export abstract class ListFilterFormsCommon<T> implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly feedbackBannerStore = inject(FeedbackBannerStore);
  protected abstract readonly EMPTY_FORM_STATE;
  protected abstract readonly EMPTY_FILTER_STATE: T;

  readonly initialFilterState = input<T>();
  readonly ships = input.required<ShipEmissionTableListItem[]>();
  readonly filterByShipLabel = input.required<string>();
  protected readonly filterByShip = new FormControl<AutocompleteSelectOption>(ALL_SHIPS_VALUE, [
    AutocompleteSelectValidators.validOptionOrEmpty('Select a ship by entering its name or IMO number'),
  ]);

  abstract readonly formGroup: FormGroup;
  protected readonly filterChanged = output<T>();

  protected abstract readonly filterState: WritableSignal<T>;
  protected readonly hasAppliedFilters = computed<boolean>(() => !isEqual(this.filterState(), this.EMPTY_FILTER_STATE));

  readonly shipOptions = computed<AutocompleteSelectOption[]>(() =>
    this.ships()
      .map((ship: ShipEmissionTableListItem) => ({
        data: ship.imoNumber,
        text: `${ship.name} (IMO: ${ship.imoNumber})`,
      }))
      .sort((a, b) => a.text?.localeCompare(b.text, 'en-GB', { sensitivity: 'base' })),
  );

  private readonly outletContainerRef = viewChild.required('outletContainer', { read: ViewContainerRef });
  private readonly contentTemplateRef = viewChild.required('contentTemplate', { read: TemplateRef });
  private readonly applyButtonRef = viewChild.required('applyButton', { read: ElementRef });
  protected readonly formElementRef: Signal<ElementRef<HTMLFormElement>> = viewChild.required('formElement');

  ngAfterViewInit(): void {
    this.outletContainerRef().createEmbeddedView(this.contentTemplateRef());
    this.setFilterState(this.initialFilterState());
    if (!isNil(this.initialFilterState())) {
      this.filterState.set(this.initialFilterState());
    }
  }

  private rerender() {
    /**
     * Forces a complete re-render of everything in contentTemplateRef by destroying and reinitializing
     * all components (calling all lifecycle hooks and rebuilding the view). This is used on successful
     * submission of the form to reset 'isSubmitted' property of every FormInput-based component and
     * ensure consistent error message / error summary display.
     */
    this.outletContainerRef().clear();
    this.outletContainerRef().createEmbeddedView(this.contentTemplateRef());
  }

  abstract getFilterState(): T;
  abstract setFilterState(filterState: T): void;

  protected runPostSubmitSideEffects(): void {}

  onSubmit(clearFilters = false): void {
    this.feedbackBannerStore.reset();

    if (this.formGroup.invalid) {
      this.feedbackBannerStore.setInvalidFormLive(this.formGroup);
    } else {
      this.resetPagination();

      const filterState = this.getFilterState();
      this.filterState.set(filterState);
      this.filterChanged.emit(filterState);

      this.runPostSubmitSideEffects();

      this.rerender();

      if (!clearFilters) {
        setTimeout(() => this.applyButtonRef().nativeElement.focus());
      }
    }
  }

  onClearFiltersClick() {
    this.formGroup.reset(this.EMPTY_FORM_STATE);
    this.onSubmit(true);
  }

  private resetPagination() {
    if (!isNil(this.route.snapshot.queryParams['page'])) {
      this.router.navigate([], { queryParams: { page: 1 }, queryParamsHandling: 'merge', relativeTo: this.route });
    }
  }
}
