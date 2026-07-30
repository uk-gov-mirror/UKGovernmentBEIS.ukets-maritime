import { AsyncPipe } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  contentChild,
  ElementRef,
  inject,
  input,
  OnInit,
  viewChild,
} from '@angular/core';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';

import { Observable, startWith, tap } from 'rxjs';

import { ConditionalContentDirective, RadioComponent, RadioOptionComponent } from '@netz/govuk-components';

import { existingControlContainer } from '@shared/providers';

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
@Component({
  selector: 'mrtm-boolean-radio-group',
  imports: [RadioComponent, ReactiveFormsModule, RadioOptionComponent, AsyncPipe],
  standalone: true,
  templateUrl: './boolean-radio-group.component.html',
  providers: [existingControlContainer],
  viewProviders: [existingControlContainer],
})
export class BooleanRadioGroupComponent implements AfterContentInit, AfterViewInit, OnInit {
  private readonly controlContainer = inject(ControlContainer);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  readonly controlName = input<string>();
  readonly legend = input<string>();
  readonly hint = input<string>();
  readonly isEditable = input(true);
  readonly positiveValue = input<boolean | string>(true);
  readonly negativeValue = input<boolean | string>(false);
  readonly positiveLabel = input('Yes');
  readonly negativeLabel = input('No');

  readonly radio = viewChild(RadioComponent, { read: ElementRef });
  value$: Observable<boolean>;

  private yesRadio: HTMLInputElement;
  private readonly conditional = contentChild(ConditionalContentDirective);

  get conditionalId() {
    return `${this.yesRadio?.id}-conditional`;
  }

  private get control() {
    return this.controlContainer.control.get(this.controlName());
  }

  ngOnInit(): void {
    this.value$ = this.control.valueChanges.pipe(
      startWith(this.control.value),
      tap((value) => this.onChoose(value)),
    );
  }

  ngAfterContentInit() {
    this.onChoose(this.control.value);
  }

  ngAfterViewInit(): void {
    this.yesRadio = this.radio().nativeElement.querySelector('input');
    this.yesRadio.setAttribute('aria-controls', this.conditionalId);
    this.setAriaExpanded(this.control.value);

    // Trigger a change detection to update the conditionalId
    this.changeDetectorRef.detectChanges();
  }

  private onChoose(value: boolean | string): void {
    const isPositiveSelected = value === this.positiveValue();
    this.setAriaExpanded(isPositiveSelected);

    const conditional = this.conditional();
    if (conditional) {
      if (isPositiveSelected && this.isEditable()) {
        conditional.enableControls();
      } else {
        conditional.disableControls();
      }
    }
  }

  private setAriaExpanded(value: boolean): void {
    if (this.yesRadio) {
      this.yesRadio.setAttribute('aria-expanded', value ? 'true' : 'false');
    }
  }
}
